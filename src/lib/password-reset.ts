import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000;

export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createResetTokenValue() {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export async function createPasswordResetToken(userId: string) {
  const token = createResetTokenValue();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { token, expiresAt };
}

export async function findPasswordResetUserId(token: string) {
  const tokenHash = hashResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  return record.userId;
}

export async function clearPasswordResetTokens(userId: string) {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
}
