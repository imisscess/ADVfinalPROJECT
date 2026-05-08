"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return (
      <main className="mx-auto w-full max-w-lg px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            You’re already logged in
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use the navbar to browse products or checkout.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/account"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
            >
              Go to account
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Browse products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6 md:px-6 md:py-10">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Login
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to continue checkout and manage your cart.
        </p>

        <form
          className="mt-6 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const res = login({ email, password });
            if (!res.ok) {
              setError(res.error ?? "Login failed.");
              return;
            }
            router.push("/account");
          }}
        >
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-border bg-surface p-3 text-sm text-slate-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
          >
            Login
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-600">
          No account?{" "}
          <Link href="/register" className="font-semibold text-brand">
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}

