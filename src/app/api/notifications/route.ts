import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/request-auth";
import { prisma } from "@/lib/prisma";
import { markAllAsRead } from "@/lib/notifications";

export async function GET(req: Request) {
  const session = await getRequestSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const session = await getRequestSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllAsRead(session.user.id);
  return NextResponse.json({ success: true });
}
