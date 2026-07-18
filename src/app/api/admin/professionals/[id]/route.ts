import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyBookingEvent } from "@/lib/notifications";
import { evaluateBadges } from "@/lib/badges";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action, rejectionReason } = await req.json();

  const pro = await prisma.professionalProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve" || action === "reactivate") {
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "APPROVED", isVerified: true, rejectionReason: null },
    });
    await evaluateBadges(id);
    await notifyBookingEvent(
      pro.user.id,
      "PRO_APPROVED",
      action === "reactivate" ? "Account reactivated" : "Profile approved!",
      action === "reactivate"
        ? "Your professional account has been reactivated on KaamSetu."
        : "Your professional profile has been approved. You can now receive bookings.",
      "/pro/dashboard"
    );
  } else if (action === "reject") {
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: rejectionReason || "Did not meet requirements" },
    });
    await notifyBookingEvent(
      pro.user.id,
      "PRO_REJECTED",
      "Profile not approved",
      "Your professional registration was not approved. Please contact support.",
      "/pro/register"
    );
  } else if (action === "remove" || action === "suspend") {
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "SUSPENDED", isVerified: false },
    });
    await notifyBookingEvent(
      pro.user.id,
      "PRO_REJECTED",
      "Removed from platform",
      "Your professional account has been removed from KaamSetu. Contact support if you believe this is a mistake.",
      "/pro/register"
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
