import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { ReviewReplyForm } from "@/components/reviews/reply-form";
import { Star } from "lucide-react";

export default async function ProReviewsPage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!pro) return null;

  const reviews = await prisma.review.findMany({
    where: { professionalId: pro.id },
    include: {
      customer: { include: { user: true } },
      reply: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {review.customer.user.name}
                      <span className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {review.comment && <p className="text-muted-foreground mb-3">{review.comment}</p>}
                    {review.reply ? (
                      <p className="text-sm pl-4 border-l-2"><span className="font-medium">Your reply:</span> {review.reply.comment}</p>
                    ) : (
                      <ReviewReplyForm reviewId={review.id} />
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
