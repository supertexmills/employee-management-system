import { LoginForm } from "@/components/auth/login-form";
import { LoginRedirect } from "@/components/auth/login-redirect";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-white">
      <Suspense fallback={null}>
        <LoginRedirect />
      </Suspense>
      <div className="dot-grid absolute inset-0 opacity-20" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-10 lg:grid-cols-2 lg:px-8">
        <div className="hidden lg:block">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              FactoryFlow
            </span>
          </Link>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Enterprise workforce control,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              built for operations
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            Secure portal access for admins, HR, and managers to manage teams,
            workforce records, and compliance from one place.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">Portal sign in</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted">
              Use your company credentials to access the dashboard.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need an account? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
