"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import { CheckCircle2 } from "lucide-react";

type PhoneOtpVerificationProps = {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onVerified: (verificationToken: string, phone: string) => void;
  disabled?: boolean;
  showCity?: boolean;
  city?: string;
  onCityChange?: (city: string) => void;
  cityPlaceholder?: string;
};

export function PhoneOtpVerification({
  phone,
  onPhoneChange,
  onVerified,
  disabled = false,
  showCity = false,
  city = "",
  onCityChange,
  cityPlaceholder,
}: PhoneOtpVerificationProps) {
  const { t } = useI18n();
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  function resetVerification() {
    setOtp("");
    setOtpSent(false);
    setVerified(false);
    setError("");
  }

  function handlePhoneChange(value: string) {
    onPhoneChange(value);
    if (otpSent || verified) resetVerification();
  }

  async function handleSendOtp() {
    setSending(true);
    setError("");

    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error || t.auth.otpSendFailed);
      return;
    }

    setOtpSent(true);
  }

  async function handleVerifyOtp() {
    setVerifying(true);
    setError("");

    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();
    setVerifying(false);

    if (!res.ok) {
      setError(data.error || t.auth.otpVerifyFailed);
      return;
    }

    setVerified(true);
    onVerified(data.verificationToken, data.phone);
  }

  return (
    <div className="space-y-4">
      <div className={showCity ? "grid grid-cols-2 gap-4" : "space-y-2"}>
        <div className="space-y-2">
          <Label htmlFor="phone">{t.auth.phone}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
            disabled={disabled || verified}
            placeholder="9876543210"
            className="bg-background/50 border-white/10"
          />
        </div>
        {showCity && onCityChange && (
          <div className="space-y-2">
            <Label htmlFor="city">{t.auth.city}</Label>
            <Input
              id="city"
              name="city"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder={cityPlaceholder || "Mumbai"}
              className="bg-background/50 border-white/10"
            />
          </div>
        )}
      </div>

      {!verified && (
        <div className="space-y-3">
          {!otpSent ? (
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/10"
              onClick={handleSendOtp}
              disabled={disabled || sending || phone.trim().length < 10}
            >
              {sending ? t.auth.sendingOtp : t.auth.sendOtp}
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="otp">{t.auth.enterOtp}</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="bg-background/50 border-white/10"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-white/10"
                  onClick={handleSendOtp}
                  disabled={disabled || sending}
                >
                  {sending ? t.auth.sendingOtp : t.auth.resendOtp}
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-brand hover:bg-brand-dark"
                  onClick={handleVerifyOtp}
                  disabled={disabled || verifying || otp.length < 4}
                >
                  {verifying ? t.auth.verifyingOtp : t.auth.verifyOtp}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {verified && (
        <p className="flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {t.auth.phoneVerified}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
