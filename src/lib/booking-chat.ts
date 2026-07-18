import type { BookingStatus } from "@prisma/client";

export const BOOKING_CHAT_STATUSES: BookingStatus[] = [
  "CONFIRMED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
];

export function isBookingChatEnabled(
  status: BookingStatus,
  professionalId?: string | null
): boolean {
  return !!professionalId && BOOKING_CHAT_STATUSES.includes(status);
}

export type BookingChatParticipant = {
  customerUserId: string;
  professionalUserId: string | null | undefined;
};

export function canAccessBookingChat(
  participant: BookingChatParticipant,
  userId: string
): boolean {
  if (userId === participant.customerUserId) return true;
  if (participant.professionalUserId && userId === participant.professionalUserId) return true;
  return false;
}

export function getBookingChatRecipient(
  participant: BookingChatParticipant,
  senderId: string
): string | null {
  if (senderId === participant.customerUserId) {
    return participant.professionalUserId ?? null;
  }
  if (participant.professionalUserId && senderId === participant.professionalUserId) {
    return participant.customerUserId;
  }
  return null;
}
