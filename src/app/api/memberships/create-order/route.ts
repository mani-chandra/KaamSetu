import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, getRazorpayConfig } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await req.json();
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId, isActive: true } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const existing = await prisma.subscription.findFirst({
    where: { userId: session.user.id, planId, status: "ACTIVE" },
  });
  if (existing) {
    return NextResponse.json({ error: "Already subscribed", subscription: existing }, { status: 400 });
  }

  const config = getRazorpayConfig();
  let order;
  try {
    order = await createRazorpayOrder(plan.price, `membership_${planId}_${session.user.id}`);
  } catch {
    return NextResponse.json({ error: "Payment gateway unavailable" }, { status: 503 });
  }

  return NextResponse.json({
    order,
    keyId: config.keyId,
    demo: !config.enabled,
    plan: { id: plan.id, name: plan.name, price: plan.price },
  });
}
