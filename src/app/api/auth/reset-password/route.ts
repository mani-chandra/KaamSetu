import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  clearPasswordResetTokens,
  createPasswordResetToken,
  findPasswordResetUserId,
} from "@/lib/password-reset";
import { sendEmail, emailTemplate } from "@/lib/email";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const userId = await findPasswordResetUserId(body.token);

    if (!userId) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await clearPasswordResetTokens(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Password reset failed" }, { status: 500 });
  }
}
