import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { professionalId } = await req.json();
  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  await prisma.savedProfessional.upsert({
    where: {
      customerId_professionalId: { customerId: customer.id, professionalId },
    },
    update: {},
    create: { customerId: customer.id, professionalId },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { professionalId } = await req.json();
  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  await prisma.savedProfessional.deleteMany({
    where: { customerId: customer.id, professionalId },
  });

  return NextResponse.json({ success: true });
}
