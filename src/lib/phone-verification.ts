import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone } from "@/lib/phone";

const DEV_OTP = "123456";
const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFICATION_TTL_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const TOKEN_BYTES = 32;

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isMsg91Configured() {
  return Boolean(process.env.MSG91_API_KEY && process.env.MSG91_OTP_TEMPLATE_ID);
}

function generateOtp() {
  if (!isMsg91Configured()) return DEV_OTP;
  return String(crypto.randomInt(100000, 999999));
}

async function sendOtpViaMsg91(national: string, otp: string) {
  const params = new URLSearchParams({
    authkey: process.env.MSG91_API_KEY!,
    template_id: process.env.MSG91_OTP_TEMPLATE_ID!,
    mobile: `91${national}`,
    otp,
    otp_length: "6",
    otp_expiry: "10",
  });

  const res = await fetch(`https://control.msg91.com/api/v5/otp?${params}`, {
    method: "POST",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MSG91 OTP failed: ${body}`);
  }
}

export async function isPhoneRegistered(phone: string) {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized.ok) return false;

  const user = await prisma.user.findUnique({
    where: { phone: normalized.e164 },
    select: { id: true },
  });

  return Boolean(user);
}

export async function sendOtp(phone: string) {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized.ok) {
    return { success: false as const, error: "invalid_phone" };
  }

  if (await isPhoneRegistered(normalized.e164)) {
    return { success: false as const, error: "phone_already_registered" };
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpChallenge.updateMany({
    where: { phone: normalized.e164, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.otpChallenge.create({
    data: {
      phone: normalized.e164,
      otpHash: hashValue(otp),
      expiresAt,
      maxAttempts: MAX_ATTEMPTS,
    },
  });

  if (isMsg91Configured()) {
    try {
      await sendOtpViaMsg91(normalized.national, otp);
    } catch (error) {
      console.error("Failed to send OTP via MSG91:", error);
      return { success: false as const, error: "otp_send_failed" };
    }
  } else {
    console.log(`[OTP dev] Phone ${normalized.e164}: ${otp}`);
  }

  return { success: true as const };
}

export async function verifyOtp(phone: string, otp: string) {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized.ok) {
    return { success: false as const, error: "invalid_phone" };
  }

  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      phone: normalized.e164,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    return { success: false as const, error: "otp_expired" };
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    return { success: false as const, error: "otp_max_attempts" };
  }

  if (hashValue(otp.trim()) !== challenge.otpHash) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    return { success: false as const, error: "invalid_otp" };
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  const verificationToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  await prisma.phoneVerification.create({
    data: {
      phone: normalized.e164,
      tokenHash: hashValue(verificationToken),
      expiresAt,
    },
  });

  return { success: true as const, verificationToken, phone: normalized.e164 };
}

export async function consumePhoneVerification(phone: string, verificationToken: string) {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized.ok) {
    return { success: false as const, error: "invalid_phone" };
  }

  const record = await prisma.phoneVerification.findUnique({
    where: { tokenHash: hashValue(verificationToken) },
  });

  if (!record || record.phone !== normalized.e164) {
    return { success: false as const, error: "invalid_verification_token" };
  }

  if (record.consumedAt) {
    return { success: false as const, error: "verification_token_used" };
  }

  if (record.expiresAt < new Date()) {
    return { success: false as const, error: "verification_token_expired" };
  }

  await prisma.phoneVerification.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return { success: true as const, phone: normalized.e164 };
}
