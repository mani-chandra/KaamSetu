import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";
import { verifyRazorpaySignature } from "@/lib/razorpay-verify";
import { getRazorpayConfig, isDemoPaymentsAllowed } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { planId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const config = getRazorpayConfig();
  const demoAllowed = isDemoPaymentsAllowed() && !config.enabled;

  if (!demoAllowed) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }
    const valid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      planId,
      status: "ACTIVE",
      razorpaySubscriptionId: razorpayPaymentId || razorpayOrderId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: { plan: true },
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
