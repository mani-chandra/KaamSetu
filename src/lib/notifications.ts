import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmailToUser, emailTemplate } from "@/lib/email";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

const EMAIL_TYPES: NotificationType[] = [
  "BOOKING_CONFIRMED",
  "BOOKING_COMPLETED",
  "BOOKING_REQUEST",
  "QUOTE_RECEIVED",
  "PAYMENT_RECEIVED",
  "PRO_APPROVED",
  "PRO_REJECTED",
  "REVIEW_RECEIVED",
];

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
}

export async function notifyBookingEvent(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  await createNotification({ userId, type, title, message, link });

  if (EMAIL_TYPES.includes(type)) {
    const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
    const url = link ? `${baseUrl}${link}` : undefined;
    await sendEmailToUser(
      userId,
      `KaamSetu: ${title}`,
      emailTemplate(title, message, url, "Open KaamSetu")
    );
  }
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
