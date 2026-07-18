import { prisma } from "@/lib/prisma";

const SMS_TYPES = ["BOOKING_CONFIRMED", "BOOKING_REQUEST", "REMINDER"] as const;

export async function sendSmsToUser(userId: string, message: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, name: true },
  });

  if (!user?.phone) return { sent: false, reason: "no_phone" };

  const apiKey = process.env.MSG91_API_KEY || process.env.TWILIO_AUTH_TOKEN;
  if (!apiKey) {
    console.log(`[SMS dev] To ${user.phone}: ${message}`);
    return { sent: true, mode: "console" };
  }

  // MSG91 India SMS (when configured)
  if (process.env.MSG91_API_KEY && process.env.MSG91_SENDER_ID) {
    try {
      const phone = user.phone.replace(/\D/g, "").slice(-10);
      await fetch("https://control.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          authkey: process.env.MSG91_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          recipients: [{ mobiles: `91${phone}`, var: message.slice(0, 160) }],
        }),
      });
      return { sent: true, mode: "msg91" };
    } catch (e) {
      console.error("SMS failed:", e);
      return { sent: false, reason: "provider_error" };
    }
  }

  console.log(`[SMS dev] To ${user.phone}: ${message}`);
  return { sent: true, mode: "console" };
}

export function shouldSendSms(type: string) {
  return SMS_TYPES.includes(type as (typeof SMS_TYPES)[number]);
}
