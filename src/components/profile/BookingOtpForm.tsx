"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import {
  verifyBookingOtp,
  resendBookingOtp,
} from "@/actions/public-booking";
import type { BookingResult } from "@/actions/public-booking";
import { OTP_RESEND_COOLDOWN_SEC as DEFAULT_RESEND_COOLDOWN_SEC, OTP_DIGITS } from "@/lib/otp-constants";

interface BookingOtpFormProps {
  slug: string;
  phone: string;
  maskedPhone: string;
  initialCooldown: number;
  onBack: () => void;
  onVerified: (result: BookingResult) => void;
}

const OTP_LEN = OTP_DIGITS;

export default function BookingOtpForm({
  slug,
  phone,
  maskedPhone,
  initialCooldown,
  onBack,
  onVerified,
}: BookingOtpFormProps) {
  const [code, setCode] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const fullCode = code.join("");

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < OTP_LEN - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!digits) return;
    const next = Array(OTP_LEN).fill("");
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setCode(next);
    inputsRef.current[Math.min(digits.length, OTP_LEN - 1)]?.focus();
  };

  const verify = async () => {
    setError(null);
    if (fullCode.length !== OTP_LEN) {
      setError("أدخل الرمز المكوّن من 6 أرقام");
      return;
    }
    setLoading(true);
    const result = await verifyBookingOtp(slug, { phone, code: fullCode });
    setLoading(false);
    if (result.success) {
      onVerified(result);
    } else {
      setError(result.error ?? "تعذّر التحقق");
      if (result.error === "انتهت صلاحية الرمز، يرجى طلب رمز جديد" ||
          result.error === "تجاوزت عدد المحاولات المسموح، يرجى طلب رمز جديد") {
        setCode(Array(OTP_LEN).fill(""));
      }
    }
  };

  const resend = async () => {
    setResending(true);
    setError(null);
    const result = await resendBookingOtp(slug, { phone });
    setResending(false);
    if (result.success) {
      setCode(Array(OTP_LEN).fill(""));
      setCooldown(result.retryAfter ?? DEFAULT_RESEND_COOLDOWN_SEC);
      toast.success("تم إرسال رمز جديد إلى واتساب");
    } else if (result.error === "COOLDOWN" && result.retryAfter) {
      setCooldown(result.retryAfter);
    } else if (result.error === "RATE_LIMITED") {
      setError("تم تجاوز حد الإرسال، حاول لاحقاً");
    } else {
      setError(result.error ?? "تعذّر إعادة الإرسال");
    }
  };

  return (
    <div className="w-full">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft size={16} />
        البيانات
      </Button>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">تأكيد الحجز</h3>
        <p className="text-sm text-muted-foreground">
          أرسلنا رمزاً مكوّناً من 6 أرقام إلى واتساب على الرقم
        </p>
        <p dir="ltr" className="text-sm font-semibold mt-1 tracking-wider">{maskedPhone}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 text-center">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-center mb-6" dir="ltr">
        {Array.from({ length: OTP_LEN }).map((_, i) => (
          <Input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={loading}
            className="size-12 text-center text-lg font-bold p-0"
            aria-label={`الرقم ${i + 1}`}
          />
        ))}
      </div>

      <Button
        onClick={verify}
        disabled={loading || fullCode.length !== OTP_LEN}
        className="w-full"
        size="lg"
      >
        {loading ? "جاري التحقق..." : "تحقق"}
      </Button>

      <div className="mt-4 flex items-center justify-center gap-2">
        {cooldown > 0 ? (
          <span className="text-xs text-muted-foreground">
            إعادة الإرسال خلال {cooldown} ثانية
          </span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={resend}
            disabled={resending}
          >
            <RotateCw size={14} />
            {resending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
          </Button>
        )}
      </div>
    </div>
  );
}