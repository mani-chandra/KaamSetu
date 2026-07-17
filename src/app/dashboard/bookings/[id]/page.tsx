import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { BookingTimeline } from "@/components/booking/timeline";
import { ReviewForm } from "@/components/reviews/review-form";
import { PaymentButton } from "@/components/payments/payment-button";
import { QuoteAcceptActions } from "@/components/booking/quote-accept-actions";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth(["CUSTOMER", "ADMIN"]);
  const { id } = await params;

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const booking = await prisma.booking.findFirst({
    where: { id, customerId: customer?.id },
    include: {
      professional: { include: { user: true } },
      category: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      payment: true,
      review: true,
      quote: true,
    },
  });

  if (!booking) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardNav />
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{booking.title}</h1>
            <BookingStatusBadge status={booking.status} />
          </div>

          <Card>
            <CardHeader><CardTitle>Booking Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Professional:</span>{" "}
                <Link href={`/professionals/${booking.professionalId}`} className="text-brand hover:underline">
                  {booking.professional.user.name}
                </Link>
              </p>
              <p><span className="font-medium">Service:</span> {booking.category.name}</p>
              <p><span className="font-medium">Type:</span> {booking.type}</p>
              {booking.scheduledDate && (
                <p><span className="font-medium">Scheduled:</span> {formatDate(booking.scheduledDate)} at {booking.scheduledTime}</p>
              )}
              <p><span className="font-medium">Address:</span> {booking.address}, {booking.city}</p>
              {booking.description && <p><span className="font-medium">Description:</span> {booking.description}</p>}
              {booking.amount && <p><span className="font-medium">Amount:</span> {formatCurrency(booking.amount)}</p>}
              {booking.quote && booking.quote.status === "SENT" && (
                <p><span className="font-medium">Quote:</span> {formatCurrency(booking.quote.amount)}</p>
              )}
            </CardContent>
          </Card>

          <BookingTimeline history={booking.statusHistory} />

          {booking.status === "QUOTED" && booking.quote?.status === "SENT" && (
            <QuoteAcceptActions bookingId={booking.id} amount={booking.quote.amount} />
          )}

          {booking.status === "COMPLETED" && booking.payment?.status !== "PAID" && booking.amount && (
            <PaymentButton bookingId={booking.id} amount={booking.amount} />
          )}

          {booking.status === "COMPLETED" && !booking.review && (
            <ReviewForm bookingId={booking.id} professionalId={booking.professionalId} />
          )}

          {booking.review && (
            <Card>
              <CardHeader><CardTitle>Your Review</CardTitle></CardHeader>
              <CardContent>
                <p>Rating: {booking.review.rating}/5</p>
                {booking.review.comment && <p className="text-muted-foreground mt-1">{booking.review.comment}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
