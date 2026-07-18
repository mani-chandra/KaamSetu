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
  if (!customer) return NextResponse.json({ favorites: [] });

  const favorites = await prisma.favoriteService.findMany({
    where: { customerId: customer.id },
    include: { category: true },
  });
  return NextResponse.json({ favorites });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId } = await req.json();
  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const favorite = await prisma.favoriteService.upsert({
    where: { customerId_categoryId: { customerId: customer.id, categoryId } },
    update: {},
    create: { customerId: customer.id, categoryId },
    include: { category: true },
  });
  return NextResponse.json({ favorite });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  if (!categoryId) {
    return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });
  }

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!customer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.favoriteService.delete({
    where: { customerId_categoryId: { customerId: customer.id, categoryId } },
  });
  return NextResponse.json({ success: true });
}
