import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/phone-verification";

const schema = z.object({
  phone: z.string().min(10),
  otp: z.string().min(4).max(9),
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid_phone: "Enter a valid 10-digit Indian mobile number",
  otp_expired: "OTP expired. Please request a new code.",
  otp_max_attempts: "Too many attempts. Please request a new code.",
  invalid_otp: "Invalid OTP. Please try again.",
};

export async function POST(req: Request) {
  try {
    const { phone, otp } = schema.parse(await req.json());
    const result = await verifyOtp(phone, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES[result.error] || "OTP verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verificationToken: result.verificationToken,
      phone: result.phone,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "OTP verification failed" }, { status: 500 });
  }
}
