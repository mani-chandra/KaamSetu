import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

const schema = z.object({
  professionalId: z.string(),
  categoryId: z.string(),
  type: z.enum(["INSTANT", "QUOTE"]),
  title: z.string().min(3),
  description: z.string().optional(),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  address: z.string(),
  city: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Please sign in to book" }, { status: 401 });
    }

    let customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!customer) {
      customer = await prisma.customerProfile.create({
        data: { userId: session.user.id },
      });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const service = await prisma.professionalService.findUnique({
      where: {
        professionalId_categoryId: {
          professionalId: data.professionalId,
          categoryId: data.categoryId,
        },
      },
      include: { professional: { include: { user: true } } },
    });

    if (!service || service.professional.status !== "APPROVED") {
      return NextResponse.json({ error: "Professional not available" }, { status: 400 });
    }

    const amount = data.type === "INSTANT" ? service.price : null;
    const status = data.type === "INSTANT" ? "CONFIRMED" : "REQUESTED";

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        professionalId: data.professionalId,
        categoryId: data.categoryId,
        type: data.type,
        status,
        title: data.title,
        description: data.description,
        scheduledDate: new Date(data.scheduledDate),
        scheduledTime: data.scheduledTime,
        address: data.address,
        city: data.city,
        amount: amount ?? undefined,
        statusHistory: {
          create: { status, note: "Booking created" },
        },
        ...(data.type === "QUOTE"
          ? {
              quote: {
                create: {
                  professionalId: data.professionalId,
                  amount: 0,
                  status: "PENDING",
                },
              },
            }
          : {}),
      },
    });

    const proUser = service.professional.user;
    await notifyBookingEvent(
      proUser.id,
      "BOOKING_REQUEST",
      "New booking request",
      `You have a new ${data.type === "INSTANT" ? "booking" : "quote request"}: ${data.title}`,
      `/pro/dashboard/bookings`
    );

    await notifyBookingEvent(
      session.user.id,
      data.type === "INSTANT" ? "BOOKING_CONFIRMED" : "BOOKING_REQUEST",
      data.type === "INSTANT" ? "Booking confirmed" : "Quote requested",
      `Your booking "${data.title}" has been ${data.type === "INSTANT" ? "confirmed" : "submitted"}.`,
      `/dashboard/bookings/${booking.id}`
    );

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
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
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookings });
  }

  if (session.user.role === "PROFESSIONAL") {
    const pro = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!pro) return NextResponse.json({ bookings: [] });

    const bookings = await prisma.booking.findMany({
      where: { professionalId: pro.id },
      include: {
        customer: { include: { user: true } },
        category: true,
        quote: true,
        payment: true,
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
