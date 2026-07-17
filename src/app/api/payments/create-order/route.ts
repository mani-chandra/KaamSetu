import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, generateInvoiceNumber, getRazorpayConfig } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await req.json();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, customer: true },
  });

  if (!booking || !booking.amount) {
    return NextResponse.json({ error: "Invalid booking" }, { status: 400 });
  }

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer || booking.customerId !== customer.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.payment?.status === "PAID") {
    return NextResponse.json({ payment: booking.payment, alreadyPaid: true });
  }

  const config = getRazorpayConfig();
  const order = await createRazorpayOrder(booking.amount, booking.id);
  const invoiceNumber = generateInvoiceNumber();

  await prisma.payment.upsert({
    where: { bookingId },
    update: {
      razorpayOrderId: order.id,
      status: "PENDING",
      invoiceNumber,
    },
    create: {
      bookingId,
      amount: booking.amount,
      status: "PENDING",
      razorpayOrderId: order.id,
      invoiceNumber,
    },
  });

  return NextResponse.json({
    order,
    keyId: config.keyId,
    demo: !config.enabled,
  });
}
