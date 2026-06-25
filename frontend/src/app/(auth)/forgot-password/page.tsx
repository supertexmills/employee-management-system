"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Factory, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import * as authApi from "@/lib/api/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success(res.message ?? "Check your email for a verification code.");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
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
          <h1 className="text-4xl font-bold leading-tight">Reset your password</h1>
          <p className="max-w-md text-lg text-white/80">
            Enter your account email and we will send a verification code valid for 5
            minutes.
          </p>
        </div>
        <p className="text-sm text-white/60">© Factory Flow</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Forgot password</h2>
            <p className="text-muted-foreground">
              Enter the email associated with your admin account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@supertexmills.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send verification code"
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
