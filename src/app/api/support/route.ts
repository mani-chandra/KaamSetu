import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, message } = await req.json();

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      subject,
      message,
    },
  });

  return NextResponse.json({ ticket });
}
