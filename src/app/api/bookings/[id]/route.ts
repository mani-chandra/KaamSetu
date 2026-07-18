import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";
import { generateServiceOtp, getServiceOtpExpiry } from "@/lib/booking-service";
import type { BookingStatus } from "@prisma/client";

const PRO_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  REQUESTED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: [],
  IN_PROGRESS: ["COMPLETED"],
};

function getNotificationForStatus(status: BookingStatus, title: string) {
  switch (status) {
    case "CONFIRMED":
      return {
        type: "BOOKING_CONFIRMED" as const,
        title: "Booking confirmed",
        message: `Your professional has accepted "${title}".`,
      };
    case "EN_ROUTE":
      return {
        type: "BOOKING_CONFIRMED" as const,
        title: "Professional on the way",
        message: `Your professional is on the way for "${title}". Share the OTP when they arrive to begin the service.`,
      };
    case "COMPLETED":
      return {
        type: "BOOKING_COMPLETED" as const,
        title: "Service completed",
        message: `"${title}" has been marked as completed.`,
      };
    case "CANCELLED":
      return {
        type: "BOOKING_CANCELLED" as const,
        title: "Booking cancelled",
        message: `"${title}" was cancelled.`,
      };
    default:
      return null;
  }
}

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
    booking.professional?.userId === session.user.id;
  const isCustomer = session.user.role === "CUSTOMER" &&
    booking.customer.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isPro && !isCustomer && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (status === "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Use OTP verification to start the service" },
      { status: 400 }
    );
  }

  if (isPro) {
    const allowed = PRO_TRANSITIONS[booking.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }
  }

  const updateData: {
    status: BookingStatus;
    serviceStartOtp?: string;
    serviceStartOtpExpiresAt?: Date;
    statusHistory: { create: { status: BookingStatus; note?: string } };
  } = {
    status,
    statusHistory: { create: { status, note } },
  };

  if (status === "EN_ROUTE" && booking.status === "CONFIRMED") {
    updateData.serviceStartOtp = generateServiceOtp();
    updateData.serviceStartOtpExpiresAt = getServiceOtpExpiry();
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  });

  const notifyUserId = isPro
    ? booking.customer.user.id
    : booking.professional?.user.id;

  if (notifyUserId) {
    const notification = getNotificationForStatus(status, booking.title);
    if (notification) {
      await notifyBookingEvent(
        notifyUserId,
        notification.type,
        notification.title,
        notification.message,
        isPro ? `/dashboard/bookings/${id}` : `/pro/dashboard/bookings`
      );
    }
  }

  return NextResponse.json({ booking: updated });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return PATCH(req, { params });
}
