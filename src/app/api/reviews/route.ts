import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfessionalStats } from "@/lib/badges";
import { notifyBookingEvent } from "@/lib/notifications";

const schema = z.object({
  bookingId: z.string(),
  professionalId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  photoUrls: z.array(z.string()).max(5).default([]),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        customerId: customer.id,
        status: "COMPLETED",
      },
      include: { professional: { include: { user: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not completed" }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({ where: { bookingId: data.bookingId } });
    if (existing) {
      return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        customerId: customer.id,
        professionalId: data.professionalId,
        rating: data.rating,
        comment: data.comment,
        photos: data.photoUrls.length
          ? { create: data.photoUrls.map((imageUrl) => ({ imageUrl })) }
          : undefined,
      },
      include: { photos: true },
    });

    await updateProfessionalStats(data.professionalId);

    await notifyBookingEvent(
      booking.professional.user.id,
      "REVIEW_RECEIVED",
      "New review received",
      `You received a ${data.rating}-star review.`,
      `/pro/dashboard/reviews`
    );

    return NextResponse.json({ review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId, comment } = await req.json();
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reply = await prisma.reviewReply.upsert({
    where: { reviewId },
    update: { comment },
    create: { reviewId, professionalId: pro.id, comment },
  });

  return NextResponse.json({ reply });
}
