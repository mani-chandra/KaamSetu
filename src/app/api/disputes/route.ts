import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, reason } = z.object({
    bookingId: z.string(),
    reason: z.string().min(10),
  }).parse(await req.json());

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) {
    return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: customer.id },
    include: {
      professional: { include: { user: true } },
      dispute: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.dispute) {
    return NextResponse.json({ error: "Dispute already exists" }, { status: 400 });
  }

  if (!["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(booking.status)) {
    return NextResponse.json({ error: "Cannot dispute this booking status" }, { status: 400 });
  }

  const dispute = await prisma.$transaction(async (tx) => {
    const d = await tx.dispute.create({
      data: { bookingId, reason, status: "OPEN" },
    });
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "DISPUTED",
        statusHistory: { create: { status: "DISPUTED", note: reason.slice(0, 200) } },
      },
    });
    return d;
  });

  if (booking.professional?.user.id) {
    await notifyBookingEvent(
      booking.professional.user.id,
      "DISPUTE_UPDATE",
      "Dispute raised",
      `A dispute was raised for "${booking.title}".`,
      `/pro/dashboard/bookings`
    );
  }

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  await Promise.all(
    admins.map((admin) =>
      notifyBookingEvent(
        admin.id,
        "DISPUTE_UPDATE",
        "New dispute",
        `Dispute on booking "${booking.title}".`,
        "/admin/disputes"
      )
    )
  );

  return NextResponse.json({ dispute });
}
