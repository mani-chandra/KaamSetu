import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createNotification } from "@/lib/notifications";
import { generateUniqueShopSlug } from "@/lib/shop-slug";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  city: z.string().optional(),
  shopName: z.string().min(2),
  description: z.string().optional(),
  address: z.string().min(5),
  pincode: z.string().optional(),
  shopPhone: z.string().optional(),
  gstNumber: z.string().optional(),
  categoryGroupId: z.string().min(1),
  categoryIds: z.array(z.string()).min(1, "Select at least one service category"),
  logoUrl: z.string().min(1, "Shop logo is required"),
  documentUrls: z.array(z.string()).min(1, "At least one verification document is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const group = await prisma.categoryGroup.findUnique({
      where: { id: data.categoryGroupId },
    });
    if (!group) {
      return NextResponse.json({ error: "Invalid category group" }, { status: 400 });
    }

    const categories = await prisma.serviceCategory.findMany({
      where: { id: { in: data.categoryIds }, groupId: data.categoryGroupId },
    });
    if (categories.length !== data.categoryIds.length) {
      return NextResponse.json({ error: "Invalid service categories for selected group" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);
    const slug = await generateUniqueShopSlug(data.shopName);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        city: data.city,
        image: data.logoUrl,
        role: "SHOP_OWNER",
        shopProfile: {
          create: {
            shopName: data.shopName,
            slug,
            description: data.description,
            address: data.address,
            city: data.city,
            pincode: data.pincode,
            phone: data.shopPhone || data.phone,
            logoUrl: data.logoUrl,
            gstNumber: data.gstNumber,
            categoryGroupId: data.categoryGroupId,
            documentUrls: data.documentUrls,
            status: "PENDING",
            categories: {
              connect: data.categoryIds.map((id) => ({ id })),
            },
          },
        },
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "ANNOUNCEMENT",
          title: "New shop registration",
          message: `${data.shopName} has submitted a shop registration for review.`,
          link: "/admin/shops",
        })
      )
    );

    return NextResponse.json({ success: true, userId: user.id, slug });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
