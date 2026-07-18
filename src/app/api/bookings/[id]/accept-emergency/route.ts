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
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true, services: true },
  });
  if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { customer: { include: { user: true } } },
    });

    if (
      !booking ||
      !booking.isEmergency ||
      booking.status !== "REQUESTED" ||
      booking.professionalId
    ) {
      return null;
    }

    const serves = pro.services.some((s) => s.categoryId === booking.categoryId);
    if (!serves) return null;

    const updated = await tx.booking.updateMany({
      where: { id: bookingId, professionalId: null, status: "REQUESTED" },
      data: {
        professionalId: pro.id,
        status: "CONFIRMED",
      },
    });

    if (updated.count === 0) return null;

    await tx.bookingStatusHistory.create({
      data: {
        bookingId,
        status: "CONFIRMED",
        note: "Emergency accepted by professional",
      },
    });

    return booking;
  });

  if (!result) {
    return NextResponse.json({ error: "Job already taken or unavailable" }, { status: 409 });
  }

  await notifyBookingEvent(
    result.customer.user.id,
    "BOOKING_CONFIRMED",
    "Emergency help on the way",
    `A professional accepted your emergency request: "${result.title}".`,
    `/dashboard/bookings/${bookingId}`
  );

  return NextResponse.json({ success: true });
}
