import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action, rejectionReason } = await req.json();

  const shop = await prisma.shopProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!shop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve" || action === "reactivate") {
    await prisma.shopProfile.update({
      where: { id },
      data: { status: "APPROVED", isVerified: true, rejectionReason: null },
    });
    await notifyBookingEvent(
      shop.user.id,
      "PRO_APPROVED",
      action === "reactivate" ? "Shop reactivated" : "Shop approved!",
      action === "reactivate"
        ? "Your shop has been reactivated on KaamSetu."
        : "Your shop profile has been approved. You can now manage your storefront.",
      "/shop/dashboard"
    );
  } else if (action === "reject") {
    await prisma.shopProfile.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: rejectionReason || "Did not meet requirements" },
    });
    await notifyBookingEvent(
      shop.user.id,
      "PRO_REJECTED",
      "Shop not approved",
      "Your shop registration was not approved. Please contact support.",
      "/shop/register"
    );
  } else if (action === "remove" || action === "suspend") {
    await prisma.shopProfile.update({
      where: { id },
      data: { status: "SUSPENDED", isVerified: false },
    });
    await notifyBookingEvent(
      shop.user.id,
      "PRO_REJECTED",
      "Shop removed from platform",
      "Your shop has been removed from KaamSetu. Contact support if you believe this is a mistake.",
      "/shop/register"
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
