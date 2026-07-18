import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId, quoteId } = await params;

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const quote = await prisma.marketplaceQuote.findFirst({
    where: { id: quoteId, bookingId, status: "SENT" },
    include: {
      booking: true,
      professional: { include: { user: true } },
    },
  });

  if (!quote || quote.booking.customerId !== customer.id) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.marketplaceQuote.update({
      where: { id: quoteId },
      data: { status: "ACCEPTED" },
    }),
    prisma.marketplaceQuote.updateMany({
      where: { bookingId, id: { not: quoteId } },
      data: { status: "REJECTED" },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        professionalId: quote.professionalId,
        status: "CONFIRMED",
        amount: quote.amount,
        statusHistory: {
          create: { status: "CONFIRMED", note: `Accepted marketplace quote: ₹${quote.amount}` },
        },
      },
    }),
  ]);

  await notifyBookingEvent(
    quote.professional.user.id,
    "QUOTE_ACCEPTED",
    "Quote accepted",
    `Customer accepted your quote of ₹${quote.amount} for "${quote.booking.title}".`,
    "/pro/dashboard/bookings"
  );

  return NextResponse.json({ success: true });
}
