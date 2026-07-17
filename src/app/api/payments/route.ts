import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, generateInvoiceNumber } from "@/lib/razorpay";
import { notifyBookingEvent } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { include: { user: true } },
      professional: { include: { user: true } },
      payment: true,
    },
  });

  if (!booking || !booking.amount) {
    return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  }

  if (booking.payment) {
    return NextResponse.json({ payment: booking.payment });
  }

  const order = await createRazorpayOrder(booking.amount, booking.id);
  const invoiceNumber = generateInvoiceNumber();

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      amount: booking.amount,
      status: "PAID",
      razorpayOrderId: order.id,
      razorpayPaymentId: `pay_demo_${Date.now()}`,
      invoiceNumber,
      paidAt: new Date(),
    },
  });

  await notifyBookingEvent(
    booking.professional.user.id,
    "PAYMENT_RECEIVED",
    "Payment received",
    `Payment of ₹${booking.amount} received for "${booking.title}".`,
    "/pro/dashboard/earnings"
  );

  return NextResponse.json({ payment, order });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) return NextResponse.json({ payments: [] });

  const payments = await prisma.payment.findMany({
    where: { booking: { customerId: customer.id } },
    include: { booking: { include: { category: true, professional: { include: { user: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}
