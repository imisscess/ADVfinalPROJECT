"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useCart } from "../cart/CartProvider";
import { useAuth } from "../auth/AuthProvider";
import { useSearch } from "../search/SearchProvider";
import { IconCart, IconLocation, IconSearch, IconUser } from "./icons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/category/otc", label: "OTC" },
  { href: "/category/prescription", label: "Prescription" },
  { href: "/category/wellness", label: "Wellness" },
  { href: "/category/first-aid", label: "First Aid" },
  { href: "/category/baby-care", label: "Baby Care" },
  { href: "/category/personal-care", label: "Personal Care" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/contact", label: "Contact" },
] as const;

export function PharmaNavbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { query, setQuery } = useSearch();

  const activeHref = useMemo(() => {
    if (!pathname) return "/";
    if (pathname.startsWith("/product/")) return "/products";
    if (pathname.startsWith("/category/")) return pathname;
    return pathname;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/70"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-sm">
            <span className="text-sm font-semibold">PL</span>
          </span>
          <div className="hidden sm:block leading-tight">
            <div className="text-base font-semibold tracking-tight text-slate-900">
              PharmaLink
            </div>
            <div className="text-xs text-slate-500">Trusted online pharmacy</div>
          </div>
        </Link>

        <div className="flex flex-1 items-center gap-3">
          <div className="relative hidden w-full max-w-xl md:block">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search for medications, health products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand/40 focus:shadow-[0_0_0_4px_rgba(109,40,217,0.10)]"
            />
          </div>

          <label className="ml-auto hidden items-center gap-2 rounded-2xl border border-border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm md:flex">
            <IconLocation className="h-5 w-5 text-slate-500" />
            <select
              className="bg-transparent outline-none"
              defaultValue="Manila"
              aria-label="Select delivery location"
            >
              <option>Manila</option>
              <option>Cebu</option>
              <option>Davao</option>
              <option>Quezon City</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/account"
                className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <IconUser className="h-5 w-5" />
                <span className="max-w-[140px] truncate">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-brand px-3 text-sm font-semibold text-white shadow-sm hover:bg-[#5b21b6]"
              >
                Register
              </Link>
            </div>
          )}

          <Link
            href={user ? "/account" : "/login"}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
            aria-label={user ? "Profile" : "Login"}
          >
            <IconUser className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-2xl border border-border bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Cart"
          >
            <IconCart className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <nav className="border-t border-border/70 bg-white/70">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
                  l.href === activeHref
                    ? "bg-brand-soft text-slate-900"
                    : "text-slate-700 hover:bg-brand-soft hover:text-slate-900",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

