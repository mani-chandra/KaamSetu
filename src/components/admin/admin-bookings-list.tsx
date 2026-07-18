"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { formatDate } from "@/lib/utils";
import type { BookingStatus } from "@prisma/client";

type BookingItem = {
  id: string;
  title: string;
  status: BookingStatus;
  city: string | null;
  scheduledDate: Date | null;
  customer: { user: { name: string | null } };
  professional: { user: { name: string | null } } | null;
  category: { name: string };
  dispute: { reason: string } | null;
};

export function AdminBookingsList({ bookings }: { bookings: BookingItem[] }) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-base">{booking.title}</CardTitle>
            <BookingStatusBadge status={booking.status} />
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              {booking.customer.user.name} → {booking.professional?.user.name ?? "Open request"} · {booking.category.name}
            </p>
            <p>
              {booking.city} · {booking.scheduledDate && formatDate(booking.scheduledDate)}
            </p>
            {booking.dispute && (
              <p className="text-red-600 mt-1">
                {t.admin.disputeLabel} {booking.dispute.reason}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
