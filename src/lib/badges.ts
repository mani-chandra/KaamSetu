import { prisma } from "@/lib/prisma";
import { BadgeType } from "@prisma/client";

export async function evaluateBadges(professionalId: string) {
  const pro = await prisma.professionalProfile.findUnique({
    where: { id: professionalId },
  });
  if (!pro) return;

  const badges: { type: BadgeType; label: string; description: string }[] = [];

  if (pro.isVerified) {
    badges.push({
      type: BadgeType.VERIFIED,
      label: "Verified Professional",
      description: "Identity and credentials verified",
    });
  }
  if (pro.avgRating >= 4.5 && pro.reviewCount >= 10) {
    badges.push({
      type: BadgeType.TOP_RATED,
      label: "Top Rated",
      description: "Consistently rated 4.5+ stars",
    });
  }
  if (pro.completedJobs >= 50) {
    badges.push({
      type: BadgeType.EXPERIENCED,
      label: "Experienced Professional",
      description: "50+ completed jobs",
    });
  }
  if (pro.responseTime && pro.responseTime <= 60) {
    badges.push({
      type: BadgeType.RESPONSIVE,
      label: "Quick Responder",
      description: "Responds within 1 hour",
    });
  }
  if (pro.isPremium) {
    badges.push({
      type: BadgeType.PREMIUM,
      label: "Premium Member",
      description: "KaamSetu Premium professional",
    });
  }

  for (const badge of badges) {
    await prisma.professionalBadge.upsert({
      where: {
        professionalId_type: {
          professionalId,
          type: badge.type,
        },
      },
      update: {},
      create: {
        professionalId,
        ...badge,
      },
    });
  }
}

export async function updateProfessionalStats(professionalId: string) {
  const reviews = await prisma.review.findMany({
    where: { professionalId },
    select: { rating: true },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const completedJobs = await prisma.booking.count({
    where: { professionalId, status: "COMPLETED" },
  });

  await prisma.professionalProfile.update({
    where: { id: professionalId },
    data: {
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
      completedJobs,
    },
  });

  await evaluateBadges(professionalId);
}
