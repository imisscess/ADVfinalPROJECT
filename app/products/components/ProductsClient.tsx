"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "../../lib/products";
import { products as allProducts } from "../../lib/products";
import { useSearch } from "../../search/SearchProvider";
import { AddToCartButton } from "./AddToCartButton";

type Cat = Product["category"] | "ALL";

function normalizeCategory(cat: string | null): Cat {
  if (!cat) return "ALL";
  const c = cat.trim().toLowerCase();
  if (c === "prescription") return "Prescription";
  if (c === "otc") return "OTC";
  if (c === "wellness") return "Wellness";
  if (c === "first-aid" || c === "firstaid") return "First Aid";
  if (c === "baby-care" || c === "babycare") return "Baby Care";
  if (c === "personal-care" || c === "personalcare") return "Personal Care";
  if (c === "all") return "ALL";
  return "ALL";
}

function matchesCategory(p: Product, cat: Cat) {
  if (cat === "ALL") return true;
  return p.category === cat;
}

export function ProductsClient({
  forcedCategory,
  title = "Products",
  subtitle = "Sample medicines and health products for a fully connected demo.",
}: {
  forcedCategory?: Product["category"];
  title?: string;
  subtitle?: string;
}) {
  const params = useSearchParams();
  const { query } = useSearch();

const catFromUrl = useMemo(() => normalizeCategory(params.get("cat")), [params]);
  const effectiveCat: Cat = forcedCategory ?? catFromUrl;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (!matchesCategory(p, effectiveCat)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [effectiveCat, query]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <Link
          href="/cart"
          className="rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Go to cart
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/products?cat=ALL"
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
            effectiveCat === "ALL"
              ? "bg-brand text-white"
              : "border border-border bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
        >
          All
        </Link>
        <Link
          href="/products?cat=OTC"
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
            effectiveCat === "OTC"
              ? "bg-brand text-white"
              : "border border-border bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
        >
          OTC
        </Link>
        <Link
          href="/products?cat=Wellness"
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
            effectiveCat === "Wellness"
              ? "bg-brand text-white"
              : "border border-border bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
        >
          Wellness
        </Link>
        <Link
          href="/products?cat=Prescription"
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
            effectiveCat === "Prescription"
              ? "bg-brand text-white"
              : "border border-border bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
        >
          Prescription
        </Link>
        <Link
          href="/products?cat=First-Aid"
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
            effectiveCat === "First Aid"
              ? "bg-brand text-white"
              : "border border-border bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
        >
          First Aid
        </Link>
        <Link
          href="/products?cat=Baby-Care"
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
            effectiveCat === "Baby Care"
              ? "bg-brand text-white"
              : "border border-border bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
        >
          Baby Care
        </Link>
        <Link
          href="/products?cat=Personal-Care"
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold shadow-sm",
            effectiveCat === "Personal Care"
              ? "bg-brand text-white"
              : "border border-border bg-white text-slate-800 hover:bg-slate-50",
          ].join(" ")}
        >
          Personal Care
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
          >
            <Link href={`/product/${p.id}`} className="block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface">
                <Image
                  src={p.imageSrc}
                  alt={p.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {p.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {p.description}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-slate-800">
                  {p.category}
                </span>
              </div>
            </Link>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-base font-semibold text-slate-900">
                ₱{p.price.toFixed(0)}
              </div>
              <AddToCartButton product={p} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-border bg-white p-6 text-sm text-slate-700 shadow-sm">
          No products match your filter/search.
        </div>
      ) : null}
    </main>
  );
}

