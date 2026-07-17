import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) return NextResponse.json({ payments: [] });

  const payments = await prisma.payment.findMany({
    where: { booking: { customerId: customer.id } },
    include: { booking: { include: { category: true, professional: { include: { user: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ payments });
}
