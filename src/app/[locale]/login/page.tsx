"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, Shield, ArrowRight, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { TokenResponse } from "@/types";

type Step = "phone" | "otp";

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === "ar";
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOTP = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/otp/send", { phone: phone.trim() });
      setStep("otp");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? (isAr ? "تعذر إرسال الرمز" : "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post<TokenResponse>("/auth/otp/verify", {
        phone: phone.trim(),
        code: otp.trim(),
        full_name: name.trim() || (isAr ? "مستخدم" : "User"),
      });
      setAuth(data.user, data.access_token, data.refresh_token);
      router.push(`/${locale}`);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? (isAr ? "رمز غير صحيح" : "Invalid OTP code"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">CH</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isAr ? "مرحباً بك" : "Welcome Back"}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {isAr ? "سجّل دخولك برقم هاتفك" : "Sign in with your phone number"}
              </p>
            </div>

            {step === "phone" ? (
              <div className="space-y-4">
                <Input
                  label={isAr ? "رقم الهاتف" : "Phone Number"}
                  type="tel"
                  placeholder="+962791234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendOTP()}
                  icon={<Phone size={16} />}
                  error={error}
                  dir="ltr"
                />
                <Button onClick={sendOTP} loading={loading} className="w-full" size="lg">
                  {isAr ? "إرسال الرمز" : "Send OTP"}
                  {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 text-center">
                  {isAr ? `تم إرسال رمز التحقق إلى ${phone}` : `OTP sent to ${phone}`}
                </p>
                <Input
                  label={isAr ? "الاسم الكامل (للمستخدمين الجدد)" : "Full Name (new users only)"}
                  type="text"
                  placeholder={isAr ? "محمد أحمد" : "John Doe"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label={isAr ? "رمز التحقق" : "OTP Code"}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && verifyOTP()}
                  icon={<Shield size={16} />}
                  error={error}
                  dir="ltr"
                  className="text-center tracking-widest text-xl font-mono"
                />
                <Button onClick={verifyOTP} loading={loading} className="w-full" size="lg">
                  {isAr ? "تحقق وادخل" : "Verify & Login"}
                </Button>
                <button
                  onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isAr ? "تغيير رقم الهاتف" : "Change phone number"}
                </button>
              </div>
            )}
          </div>

          {/* Dev hint */}
          <p className="text-center text-xs text-gray-300 mt-4">
            {isAr ? "في وضع التطوير: الرمز يظهر في سجلات الخادم" : "Dev mode: OTP printed in server logs"}
          </p>
        </div>
      </main>
    </>
  );
}
