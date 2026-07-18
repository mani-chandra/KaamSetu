import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

const schema = z.object({
  amount: z.number().positive(),
  message: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;
  const { amount, message } = schema.parse(await req.json());

  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: { include: { user: true } } },
  });

  if (!booking || booking.type !== "MARKETPLACE" || !["REQUESTED", "QUOTED"].includes(booking.status)) {
    return NextResponse.json({ error: "Booking not open for quotes" }, { status: 400 });
  }

  const servesCategory = await prisma.professionalService.findFirst({
    where: { professionalId: pro.id, categoryId: booking.categoryId },
  });
  if (!servesCategory) {
    return NextResponse.json({ error: "You do not offer this service" }, { status: 400 });
  }

  const quote = await prisma.marketplaceQuote.upsert({
    where: { bookingId_professionalId: { bookingId, professionalId: pro.id } },
    create: {
      bookingId,
      professionalId: pro.id,
      amount,
      message,
      status: "SENT",
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    update: { amount, message, status: "SENT" },
  });

  if (booking.status === "REQUESTED") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "QUOTED",
        statusHistory: { create: { status: "QUOTED", note: "Marketplace quotes received" } },
      },
    });
  }

  await notifyBookingEvent(
    booking.customer.user.id,
    "QUOTE_RECEIVED",
    "New quote on your request",
    `A professional quoted ₹${amount} for "${booking.title}".`,
    `/dashboard/bookings/${bookingId}`
  );

  return NextResponse.json({ quote });
}
