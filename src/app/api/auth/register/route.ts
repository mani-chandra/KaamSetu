import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { consumePhoneVerification, isPhoneRegistered } from "@/lib/phone-verification";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  verificationToken: z.string().min(1),
  city: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const verification = await consumePhoneVerification(data.phone, data.verificationToken);
    if (!verification.success) {
      return NextResponse.json({ error: "verifyPhoneFirst" }, { status: 400 });
    }

    if (await isPhoneRegistered(verification.phone)) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: verification.phone,
        phoneVerified: new Date(),
        city: data.city,
        role: "CUSTOMER",
        customerProfile: { create: {} },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
