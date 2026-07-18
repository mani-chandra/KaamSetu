import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

const CANCELLABLE = ["REQUESTED", "QUOTED", "CONFIRMED"];

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await _req.json().catch(() => ({}));
  const reason = typeof body.reason === "string" ? body.reason : "Cancelled by customer";

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id, customerId: customer.id },
    include: { professional: { include: { user: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!CANCELLABLE.includes(booking.status)) {
    return NextResponse.json({ error: "This booking cannot be cancelled" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancellationReason: reason,
      statusHistory: { create: { status: "CANCELLED", note: reason } },
    },
  });

  if (booking.professional?.user.id) {
    await notifyBookingEvent(
      booking.professional.user.id,
      "BOOKING_CANCELLED",
      "Booking cancelled",
      `"${booking.title}" was cancelled by the customer.`,
      "/pro/dashboard/bookings"
    );
  }

  return NextResponse.json({ booking: updated });
}
