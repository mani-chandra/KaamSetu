import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createBookingRecord,
  notifyBookingCreated,
  notifyEmergencyPros,
  notifyMarketplacePros,
} from "@/lib/booking-create";
import { getBookingFlow } from "@/lib/booking-flows";

const baseSchema = z.object({
  professionalId: z.string().optional(),
  categoryId: z.string(),
  categorySlug: z.string(),
  title: z.string().min(3),
  description: z.string().optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  photoUrls: z.array(z.string().url()).max(5).optional(),
  videoUrls: z.array(z.string().url()).max(2).optional(),
  metadata: z.record(z.string()).optional(),
  specialInstructions: z.string().optional(),
  packageId: z.string().optional(),
  consultationMode: z.string().optional(),
  budget: z.number().optional(),
  eventDate: z.string().optional(),
  recurring: z
    .object({
      frequency: z.string(),
      preferredTime: z.string(),
      durationWeeks: z.number().optional(),
      endDate: z.string().optional(),
    })
    .optional(),
  isEmergency: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

async function getOrCreateCustomer(userId: string) {
  let customer = await prisma.customerProfile.findUnique({ where: { userId } });
  if (!customer) {
    customer = await prisma.customerProfile.create({ data: { userId } });
  }
  return customer;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Please sign in to book" }, { status: 401 });
    }
    if (session.user.role === "PROFESSIONAL") {
      return NextResponse.json({ error: "Professionals cannot create customer bookings" }, { status: 403 });
    }

    const customer = await getOrCreateCustomer(session.user.id);
    const body = await req.json();
    const data = baseSchema.parse(body);

    const flow = data.isEmergency ? "emergency" : getBookingFlow(data.categorySlug);

    if (flow !== "marketplace" && flow !== "emergency" && !data.professionalId) {
      return NextResponse.json({ error: "Professional is required" }, { status: 400 });
    }

    if (flow === "consultation" && !data.consultationMode) {
      return NextResponse.json({ error: "Consultation mode is required" }, { status: 400 });
    }

    if (flow === "recurring" && !data.recurring) {
      return NextResponse.json({ error: "Recurring schedule is required" }, { status: 400 });
    }

    const needsAddress = !data.consultationMode || ["Home Visit", "In-Person"].includes(data.consultationMode);
    if (needsAddress && flow !== "marketplace" && flow !== "emergency") {
      if (!data.address || !data.city) {
        return NextResponse.json({ error: "Address and city are required" }, { status: 400 });
      }
    }

    const booking = await createBookingRecord({
      customerId: customer.id,
      ...data,
    });

    await notifyBookingCreated(booking, session.user.id);

    if (flow === "marketplace") {
      await notifyMarketplacePros(data.categoryId, data.city, data.title);
    }
    if (flow === "emergency") {
      await notifyEmergencyPros(data.categoryId, data.city, data.title);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "CUSTOMER") {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!customer) return NextResponse.json({ bookings: [] });

    const bookings = await prisma.booking.findMany({
      where: { customerId: customer.id },
      include: {
        professional: { include: { user: true } },
        category: true,
        payment: true,
        review: true,
        marketplaceQuotes: { include: { professional: { include: { user: true } } } },
        recurringSchedule: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  }

  if (session.user.role === "PROFESSIONAL") {
    const pro = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      include: { services: true },
    });
    if (!pro) return NextResponse.json({ bookings: [] });

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { professionalId: pro.id },
          {
            type: "MARKETPLACE",
            marketplaceQuotes: { some: { professionalId: pro.id } },
          },
          {
            type: "EMERGENCY",
            status: "REQUESTED",
            categoryId: { in: pro.services.map((s) => s.categoryId) },
          },
        ],
      },
      include: {
        customer: { include: { user: true } },
        category: true,
        quote: true,
        payment: true,
        marketplaceQuotes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  }

  const bookings = await prisma.booking.findMany({
    include: {
      customer: { include: { user: true } },
      professional: { include: { user: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookings });
}
