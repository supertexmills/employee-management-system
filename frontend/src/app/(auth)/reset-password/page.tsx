"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Factory, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import * as authApi from "@/lib/api/auth";
import { toast } from "sonner";

const OTP_EXPIRES_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRES_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    if (fromQuery) setEmail(fromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const otpExpired = secondsLeft <= 0;

  function formatTime(totalSeconds: number) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleResend() {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    try {
      const res = await authApi.resendOtp(email);
      toast.success(res.message ?? "A new code has been sent.");
      setSecondsLeft(OTP_EXPIRES_SECONDS);
      setOtp("");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resend failed");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (otpExpired) {
      toast.error("Verification code expired. Please resend a new code.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authApi.resetPassword({
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      toast.success(res.message ?? "Password updated. Please sign in.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-blue-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Factory className="size-6" />
          </div>
          <div>
            <p className="text-lg font-bold">Factory Flow</p>
            <p className="text-sm text-white/70">Operations Dashboard</p>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">Create a new password</h1>
          <p className="max-w-md text-lg text-white/80">
            Enter the 6-digit code from your email and choose a new password.
          </p>
        </div>
        <p className="text-sm text-white/60">© Factory Flow</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Reset password</h2>
            <p className="text-muted-foreground">
              Code expires in{" "}
              <span className={otpExpired ? "text-destructive font-medium" : "font-medium"}>
                {formatTime(secondsLeft)}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                className="h-11 tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={submitting || otpExpired}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              disabled={resending || resendCooldown > 0 || !email}
              onClick={() => void handleResend()}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Resending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend code in ${resendCooldown}s`
              ) : (
                "Resend code"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
