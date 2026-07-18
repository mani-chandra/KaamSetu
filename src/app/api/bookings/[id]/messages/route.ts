import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import {
  canAccessBookingChat,
  getBookingChatRecipient,
  isBookingChatEnabled,
} from "@/lib/booking-chat";

const sendSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

async function getAuthorizedBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { include: { user: true } },
      professional: { include: { user: true } },
    },
  });

  if (!booking) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };

  const participant = {
    customerUserId: booking.customer.userId,
    professionalUserId: booking.professional?.userId,
  };

  if (!canAccessBookingChat(participant, userId)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  if (!isBookingChatEnabled(booking.status, booking.professionalId)) {
    return {
      error: NextResponse.json({ error: "Chat is not available for this booking" }, { status: 403 }),
    };
  }

  return { booking, participant };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getAuthorizedBooking(id, session.user.id);
  if ("error" in result && result.error) return result.error;

  const messages = await prisma.bookingMessage.findMany({
    where: { bookingId: id },
    include: {
      sender: { select: { id: true, name: true, image: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getAuthorizedBooking(id, session.user.id);
  if ("error" in result && result.error) return result.error;

  const { participant } = result;
  const { body } = sendSchema.parse(await req.json());

  const message = await prisma.bookingMessage.create({
    data: {
      bookingId: id,
      senderId: session.user.id,
      body,
    },
    include: {
      sender: { select: { id: true, name: true, image: true, role: true } },
    },
  });

  const recipientId = getBookingChatRecipient(participant, session.user.id);
  if (recipientId) {
    const senderName = session.user.name ?? (session.user.role === "PROFESSIONAL" ? "Professional" : "Customer");
    const link =
      session.user.role === "PROFESSIONAL"
        ? `/dashboard/bookings/${id}`
        : `/pro/dashboard/bookings#booking-${id}`;

    await createNotification({
      userId: recipientId,
      type: "BOOKING_MESSAGE",
      title: "New booking message",
      message: `${senderName}: ${body.slice(0, 120)}${body.length > 120 ? "…" : ""}`,
      link,
    });
  }

  return NextResponse.json({ message });
}
