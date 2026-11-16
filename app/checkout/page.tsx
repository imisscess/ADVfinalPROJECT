"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "../cart/CartProvider";
import { useAuth } from "../auth/AuthProvider";
import { RequireCustomerAuth } from "../auth/RequireCustomerAuth";

function CheckoutPageContent() {
  const { subtotal, clear, count } = useCart();
  const { user } = useAuth();
  const [placed, setPlaced] = useState(false);

  const disabled = useMemo(() => count === 0, [count]);

  if (placed) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Order placed
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Thanks{user ? `, ${user.name}` : ""}! Your demo order was created.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
            >
              Continue shopping
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter delivery details and place your order.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Full name
              <input
                defaultValue={user?.name ?? ""}
                className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Email
              <input
                defaultValue={user?.email ?? ""}
                className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800 sm:col-span-2">
              Delivery address
              <input
                placeholder="House no., street, barangay, city"
                className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Payment method
              <select className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]">
                <option>Cash on delivery</option>
                <option>Card</option>
                <option>eWallet</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Notes (optional)
              <input
                placeholder="Gate code, landmarks, etc."
                className="h-11 rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                clear();
                setPlaced(true);
              }}
              className={[
                "inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-4",
                disabled
                  ? "bg-slate-200 text-slate-500"
                  : "bg-brand text-white hover:bg-[#5b21b6] focus:ring-[rgba(109,40,217,0.20)]",
              ].join(" ")}
            >
              Place order
            </button>
            <Link
              href="/cart"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Back to cart
            </Link>
          </div>
        </section>

        <aside className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Order total</div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span className="font-semibold">{count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="font-semibold">₱{subtotal.toFixed(0)}</span>
            </div>
          </div>
          <div className="mt-4 text-xs leading-6 text-slate-600">
            This is a demo checkout flow with real cart + localStorage.
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <RequireCustomerAuth
      title="Sign in to check out"
      body="An account is required before you can place an order."
    >
      <CheckoutPageContent />
    </RequireCustomerAuth>
  );
}

