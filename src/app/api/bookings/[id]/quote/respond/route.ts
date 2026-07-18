import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;
  const { action } = await req.json() as { action: "accept" | "reject" };

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: customer.id, status: "QUOTED" },
    include: { quote: true, professional: { include: { user: true } } },
  });

  if (!booking || !booking.quote || booking.quote.status !== "SENT") {
    return NextResponse.json({ error: "No quote to respond to" }, { status: 400 });
  }

  if (action === "accept") {
    await prisma.quote.update({
      where: { bookingId },
      data: { status: "ACCEPTED" },
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        amount: booking.quote.amount,
        statusHistory: { create: { status: "CONFIRMED", note: "Quote accepted by customer" } },
      },
    });
    if (booking.professional?.user.id) {
      await notifyBookingEvent(
        booking.professional.user.id,
        "QUOTE_ACCEPTED",
        "Quote accepted",
        `Customer accepted your quote of ₹${booking.quote.amount} for "${booking.title}".`,
        "/pro/dashboard/bookings"
      );
    }
  } else {
    await prisma.quote.update({
      where: { bookingId },
      data: { status: "REJECTED" },
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        statusHistory: { create: { status: "CANCELLED", note: "Quote rejected by customer" } },
      },
    });
    if (booking.professional?.user.id) {
      await notifyBookingEvent(
        booking.professional.user.id,
        "BOOKING_CANCELLED",
        "Quote rejected",
        `Customer rejected the quote for "${booking.title}".`,
        "/pro/dashboard/bookings"
      );
    }
  }

  return NextResponse.json({ success: true });
}
