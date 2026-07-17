import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";
import type { BookingStatus } from "@prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, note } = await req.json() as { status: BookingStatus; note?: string };

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: { include: { user: true } },
      professional: { include: { user: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isPro = session.user.role === "PROFESSIONAL" &&
    booking.professional.userId === session.user.id;
  const isCustomer = session.user.role === "CUSTOMER" &&
    booking.customer.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isPro && !isCustomer && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status,
      statusHistory: { create: { status, note } },
    },
  });

  const notifyUserId = isPro ? booking.customer.user.id : booking.professional.user.id;
  await notifyBookingEvent(
    notifyUserId,
    status === "COMPLETED" ? "BOOKING_COMPLETED" : "BOOKING_CONFIRMED",
    `Booking ${status.toLowerCase().replace("_", " ")}`,
    `"${booking.title}" is now ${status.toLowerCase().replace("_", " ")}.`,
    isPro ? `/dashboard/bookings/${id}` : `/pro/dashboard/bookings`
  );

  return NextResponse.json({ booking: updated });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return PATCH(req, { params });
}
