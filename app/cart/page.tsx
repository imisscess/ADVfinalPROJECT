"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "./CartProvider";
import { getProductById } from "../lib/products";
import { RequireCustomerAuth } from "../auth/RequireCustomerAuth";

function CartPageContent() {
  const { lines, subtotal, setQty, remove, clear } = useCart();

  const detailed = useMemo(() => {
    return lines
      .map((l) => {
        const p = getProductById(l.productId);
        return p ? { line: l, product: p } : null;
      })
      .filter(Boolean) as Array<{
      line: { productId: string; quantity: number };
      product: NonNullable<ReturnType<typeof getProductById>>;
    }>;
  }, [lines]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Cart
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review your items, update quantity, or proceed to checkout.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={clear}
            className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Clear cart
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          {detailed.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-slate-700">
              Your cart is empty. Browse the catalog to add items.
              <div className="mt-4">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
                >
                  Browse products
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {detailed.map(({ line, product }) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="flex items-center gap-4"
                  >
                    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-surface">
                      <Image
                        src={product.imageSrc}
                        alt={product.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {product.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {product.category}
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-1 items-center justify-between gap-3 sm:justify-end">
                    <div className="text-sm font-semibold text-slate-900">
                      ₱{product.price.toFixed(0)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(product.id, Math.max(0, line.quantity - 1))}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-white text-slate-900 shadow-sm hover:bg-slate-50"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <input
                        inputMode="numeric"
                        value={String(line.quantity)}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (!Number.isFinite(n)) return;
                          setQty(product.id, n);
                        }}
                        className="h-10 w-14 rounded-xl border border-border bg-white text-center text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(product.id, line.quantity + 1)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-white text-slate-900 shadow-sm hover:bg-slate-50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-slate-900">Summary</div>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">₱{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span className="font-semibold">₱0</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-semibold text-slate-900">
                ₱{subtotal.toFixed(0)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className={[
              "mt-5 inline-flex h-11 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-4",
              detailed.length === 0
                ? "pointer-events-none bg-slate-200 text-slate-500"
                : "bg-brand text-white hover:bg-[#5b21b6] focus:ring-[rgba(109,40,217,0.20)]",
            ].join(" ")}
          >
            Proceed to checkout
          </Link>

          <div className="mt-4 text-xs leading-6 text-slate-600">
            Taxes and shipping are simplified for this demo.
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CartPage() {
  return (
    <RequireCustomerAuth
      title="Sign in to view your cart"
      body="Create or sign in to an account to add products, view your cart, and check out."
    >
      <CartPageContent />
    </RequireCustomerAuth>
  );
}

