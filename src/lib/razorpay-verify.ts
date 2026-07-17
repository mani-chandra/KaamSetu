import crypto from "crypto";
import { getRazorpayConfig } from "@/lib/razorpay";

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const config = getRazorpayConfig();
  if (!config.enabled) return true;

  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", config.keySecret)
    .update(body)
    .digest("hex");
  return expected === signature;
}
