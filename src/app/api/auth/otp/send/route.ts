import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp } from "@/lib/phone-verification";

const schema = z.object({
  phone: z.string().min(10),
});

const ERROR_MESSAGES: Record<string, string> = {
  invalid_phone: "Enter a valid 10-digit Indian mobile number",
  phone_already_registered: "This phone number is already registered",
  otp_send_failed: "Unable to send OTP. Please try again.",
};

export async function POST(req: Request) {
  try {
    const { phone } = schema.parse(await req.json());
    const result = await sendOtp(phone);

    if (!result.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES[result.error] || "Unable to send OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to send OTP" }, { status: 500 });
  }
}
