import type { BookingStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import type { translations } from "@/lib/i18n/translations";

type StatusHistoryItem = {
  id: string;
  status: BookingStatus;
  note: string | null;
  createdAt: Date;
};

export function buildTimelineItems(
  history: StatusHistoryItem[],
  bookingStatusLabels: (typeof translations)["en"]["bookingStatus"]
) {
  return history.map((item, index) => ({
    id: item.id,
    statusLabel: bookingStatusLabels[item.status],
    note: item.note,
    dateLabel: formatDate(item.createdAt),
    isLatest: index === history.length - 1,
  }));
}
