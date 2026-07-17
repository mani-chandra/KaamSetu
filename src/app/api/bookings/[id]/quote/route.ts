import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;
  const { amount, message } = await req.json();

  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, professionalId: pro.id },
    include: { customer: { include: { user: true } }, quote: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.quote.update({
    where: { bookingId },
    data: { amount, message, status: "SENT", validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "QUOTED",
      amount,
      statusHistory: { create: { status: "QUOTED", note: `Quote sent: ₹${amount}` } },
    },
  });

  await notifyBookingEvent(
    booking.customer.user.id,
    "QUOTE_RECEIVED",
    "Quote received",
    `You received a quote of ₹${amount} for "${booking.title}".`,
    `/dashboard/bookings/${bookingId}`
  );

  return NextResponse.json({ success: true });
}
