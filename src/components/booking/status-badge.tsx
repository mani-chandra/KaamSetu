"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import type { BookingStatus } from "@prisma/client";

const statusStyles: Record<BookingStatus, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-800",
  QUOTED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  EN_ROUTE: "bg-orange-100 text-orange-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-teal-100 text-teal-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  DISPUTED: "bg-red-100 text-red-800",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useI18n();
  return <Badge className={statusStyles[status]}>{t.bookingStatus[status]}</Badge>;
}
