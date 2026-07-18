import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay-verify";
import { notifyBookingEvent } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
      professional: { include: { user: true } },
      customer: true,
    },
  });

  if (!booking?.payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer || booking.customerId !== customer.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (razorpaySignature) {
    const valid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
  }

  const payment = await prisma.payment.update({
    where: { bookingId },
    data: {
      status: "PAID",
      razorpayPaymentId,
      paidAt: new Date(),
    },
  });

  if (booking.professional?.user.id) {
    await notifyBookingEvent(
      booking.professional.user.id,
      "PAYMENT_RECEIVED",
      "Payment received",
      `Payment of ₹${booking.amount} received for "${booking.title}".`,
      "/pro/dashboard/earnings"
    );
  }

  return NextResponse.json({ payment });
}
