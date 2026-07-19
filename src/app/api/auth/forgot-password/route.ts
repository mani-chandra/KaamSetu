import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendEmail, emailTemplate } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const { token } = await createPasswordResetToken(user.id);
      const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

      const emailResult = await sendEmail({
        to: email,
        subject: "KaamSetu: Reset your password",
        html: emailTemplate(
          "Reset your password",
          "We received a request to reset your KaamSetu password. This link expires in 1 hour. If you did not request this, you can ignore this email.",
          resetUrl,
          "Reset password"
        ),
      });

      if (emailResult.mode === "dev" && process.env.NODE_ENV === "development") {
        console.log(`[password-reset:dev] Reset link for ${email}: ${resetUrl}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to process request" }, { status: 500 });
  }
}
