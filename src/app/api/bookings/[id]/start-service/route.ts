import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";
import { isServiceOtpValid } from "@/lib/booking-service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { otp } = (await req.json()) as { otp?: string };

  if (!otp?.trim()) {
    return NextResponse.json({ error: "OTP is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: { include: { user: true } },
      professional: { include: { user: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (booking.professional?.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status !== "EN_ROUTE") {
    return NextResponse.json({ error: "Booking is not ready to start" }, { status: 400 });
  }

  if (
    !isServiceOtpValid(
      booking.serviceStartOtp,
      booking.serviceStartOtpExpiresAt,
      otp
    )
  ) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      serviceStartedAt: new Date(),
      statusHistory: { create: { status: "IN_PROGRESS", note: "Service started after OTP verification" } },
    },
  });

  await notifyBookingEvent(
    booking.customer.user.id,
    "BOOKING_CONFIRMED",
    "Service started",
    `${booking.professional?.user.name ?? "Your professional"} has started "${booking.title}".`,
    `/dashboard/bookings/${id}`
  );

  return NextResponse.json({ booking: updated });
}
