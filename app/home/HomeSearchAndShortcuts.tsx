"use client";

import Link from "next/link";
import { useMemo } from "react";
import { products } from "../lib/products";
import { useSearch } from "../search/SearchProvider";

export function HomeSearchAndShortcuts() {
  const { query, setQuery } = useSearch();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [query]);

  return (
    <section className="mt-10 rounded-3xl border border-border bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Search medicines
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Type to filter the catalog in real time.
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for medications, health products…"
            className="mt-4 h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
          />

          {matches.length > 0 ? (
            <div className="mt-4 space-y-2">
              {matches.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm hover:bg-white"
                >
                  <span className="font-semibold text-slate-900">{p.name}</span>
                  <span className="text-slate-600">₱{p.price.toFixed(0)}</span>
                </Link>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-slate-700">
              No matching products.
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div className="text-sm font-semibold text-slate-900">
            Category shortcuts
          </div>
          <Link
            href="/category/otc"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            OTC
            <div className="mt-1 text-xs text-slate-600">Cough, cold, pain</div>
          </Link>
          <Link
            href="/category/wellness"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Wellness
            <div className="mt-1 text-xs text-slate-600">
              Vitamins &amp; supplements
            </div>
          </Link>
          <Link
            href="/category/prescription"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Prescription
            <div className="mt-1 text-xs text-slate-600">Rx medicines</div>
          </Link>
          <Link
            href="/category/first-aid"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            First Aid
            <div className="mt-1 text-xs text-slate-600">
              Bandages &amp; wound care
            </div>
          </Link>
          <Link
            href="/category/baby-care"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Baby Care
            <div className="mt-1 text-xs text-slate-600">
              Diapers &amp; gentle care
            </div>
          </Link>
          <Link
            href="/category/personal-care"
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            Personal Care
            <div className="mt-1 text-xs text-slate-600">
              Skin &amp; hygiene essentials
            </div>
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
          >
            View all products
          </Link>
        </div>
      </div>
    </section>
  );
}

