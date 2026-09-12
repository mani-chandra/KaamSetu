export type NormalizedIndianPhone =
  | { ok: true; e164: string; national: string }
  | { ok: false; error: "invalid_phone" };

export function normalizeIndianPhone(input: string): NormalizedIndianPhone {
  const digits = input.replace(/\D/g, "");
  let national: string;

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    national = digits;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else {
    return { ok: false, error: "invalid_phone" };
  }

  if (!/^[6-9]\d{9}$/.test(national)) {
    return { ok: false, error: "invalid_phone" };
  }

  return { ok: true, e164: `+91${national}`, national };
}
