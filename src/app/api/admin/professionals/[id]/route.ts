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

  if (action === "approve") {
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "APPROVED", isVerified: true, rejectionReason: null },
    });
    await evaluateBadges(id);
    await notifyBookingEvent(
      pro.user.id,
      "PRO_APPROVED",
      "Profile approved!",
      "Your professional profile has been approved. You can now receive bookings.",
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
  } else if (action === "suspend") {
    await prisma.professionalProfile.update({
      where: { id },
      data: { status: "SUSPENDED" },
    });
  }

  return NextResponse.json({ success: true });
}
