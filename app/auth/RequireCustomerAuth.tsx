"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

function loginHref(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

function registerHref(next: string) {
  return `/register?next=${encodeURIComponent(next)}`;
}

export function RequireCustomerAuth({
  children,
  title = "Sign in to continue",
  body = "An account is required to use the cart and checkout.",
}: {
  children: React.ReactNode;
  title?: string;
  body?: string;
}) {
  const pathname = usePathname() || "/";
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-3xl border border-border bg-white p-6 text-sm text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          Checking your account…
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={loginHref(pathname)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
            >
              Login
            </Link>
            <Link
              href={registerHref(pathname)}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return children;
}

export function safeAuthNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}
