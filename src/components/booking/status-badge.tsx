import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@prisma/client";

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  REQUESTED: { label: "Requested", className: "bg-yellow-100 text-yellow-800" },
  QUOTED: { label: "Quote Sent", className: "bg-blue-100 text-blue-800" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-800" },
  IN_PROGRESS: { label: "In Progress", className: "bg-purple-100 text-purple-800" },
  COMPLETED: { label: "Completed", className: "bg-teal-100 text-teal-800" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
  DISPUTED: { label: "Disputed", className: "bg-red-100 text-red-800" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
}
