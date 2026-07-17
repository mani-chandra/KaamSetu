import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const { planId } = await req.json();
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      planId,
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  if (plan.target === "PROFESSIONAL") {
    const pro = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (pro) {
      await prisma.professionalProfile.update({
        where: { id: pro.id },
        data: { isPremium: true },
      });
    }
  }

  await notifyBookingEvent(
    session.user.id,
    "PROMOTION",
    "Membership activated",
    `Your ${plan.name} membership is now active.`,
    "/memberships"
  );

  return NextResponse.json({ subscription });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ subscriptions: [] });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: { plan: true },
  });

  return NextResponse.json({ subscriptions });
}
