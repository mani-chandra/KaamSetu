import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const disputes = await prisma.dispute.findMany({
    include: {
      booking: {
        include: {
          customer: { include: { user: true } },
          professional: { include: { user: true } },
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ disputes });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    id: z.string(),
    status: z.enum(["IN_REVIEW", "RESOLVED", "CLOSED"]),
    resolution: z.string().optional(),
    refundAmount: z.number().optional(),
  }).parse(await req.json());

  const dispute = await prisma.dispute.update({
    where: { id: data.id },
    data: {
      status: data.status,
      resolution: data.resolution,
      refundAmount: data.refundAmount,
    },
    include: {
      booking: {
        include: {
          customer: { include: { user: true } },
          professional: { include: { user: true } },
          payment: true,
        },
      },
    },
  });

  if (data.status === "RESOLVED" && dispute.booking.payment) {
    await prisma.payment.update({
      where: { bookingId: dispute.bookingId },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });
  }

  await notifyBookingEvent(
    dispute.booking.customer.user.id,
    "DISPUTE_UPDATE",
    "Dispute updated",
    `Your dispute has been marked as ${data.status.toLowerCase()}.`,
    `/dashboard/bookings/${dispute.bookingId}`
  );

  return NextResponse.json({ dispute });
}
