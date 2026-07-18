import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { BookingActions } from "@/components/booking/booking-actions";
import { QuoteForm } from "@/components/booking/quote-form";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { EmergencyAcceptButton, MarketplaceQuoteForm } from "@/components/booking/marketplace-actions";
import { BookingChat } from "@/components/booking/booking-chat";
import { isBookingChatEnabled } from "@/lib/booking-chat";
import { formatDate, formatCurrency } from "@/lib/utils";
import Image from "next/image";

export default async function ProBookingsPage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { services: true },
  });
  if (!pro) return null;

  const categoryIds = pro.services.map((s) => s.categoryId);

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { professionalId: pro.id },
        {
          type: "MARKETPLACE",
          status: { in: ["REQUESTED", "QUOTED"] },
          categoryId: { in: categoryIds },
        },
        {
          type: "EMERGENCY",
          status: "REQUESTED",
          professionalId: null,
          categoryId: { in: categoryIds },
        },
      ],
    },
    include: {
      customer: { include: { user: true } },
      category: true,
      quote: true,
      photos: true,
      media: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} id={`booking-${booking.id}`}>
                <CardHeader className="flex flex-row justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{booking.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {booking.customer.user.name} · {booking.category.name}
                      {booking.isEmergency && " · 🚨 Emergency"}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  {booking.description && <p className="text-sm">{booking.description}</p>}
                  {(booking.photos.length > 0 || booking.media.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {booking.photos.map((photo) => (
                        <a key={photo.id} href={photo.imageUrl} target="_blank" rel="noopener noreferrer" className="relative h-16 w-16 rounded-lg overflow-hidden border border-white/10">
                          <Image src={photo.imageUrl} alt="" fill className="object-cover" unoptimized />
                        </a>
                      ))}
                    </div>
                  )}
                  {booking.scheduledDate && (
                    <p className="text-sm text-muted-foreground">
                      {formatDate(booking.scheduledDate)} at {booking.scheduledTime} · {booking.address}, {booking.city}
                    </p>
                  )}
                  {booking.amount && <p className="text-sm font-medium">{formatCurrency(booking.amount)}</p>}

                  {booking.type === "EMERGENCY" && !booking.professionalId && (
                    <EmergencyAcceptButton bookingId={booking.id} />
                  )}

                  {booking.type === "MARKETPLACE" && !booking.professionalId && (
                    <MarketplaceQuoteForm bookingId={booking.id} />
                  )}

                  {booking.type === "QUOTE" && booking.status === "REQUESTED" && booking.professionalId === pro.id && (
                    <QuoteForm bookingId={booking.id} />
                  )}

                  {booking.professionalId === pro.id && (
                    <BookingActions bookingId={booking.id} status={booking.status} />
                  )}

                  {booking.professionalId === pro.id && (
                    <BookingChat
                      bookingId={booking.id}
                      currentUserId={session.user.id}
                      enabled={isBookingChatEnabled(booking.status, booking.professionalId)}
                      otherPartyName={booking.customer.user.name}
                      otherPartyImage={booking.customer.user.image}
                      viewerRole="professional"
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
