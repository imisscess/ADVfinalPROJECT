"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../app/auth/AuthProvider";
import { useCart } from "../app/cart/CartProvider";
import { useSearch } from "../app/search/SearchProvider";

const links = [
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
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { query, setQuery } = useSearch();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="font-semibold text-slate-900">301 EAST Drugstore</Link>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medicines, products..."
          className="ml-2 h-10 w-full max-w-lg rounded-2xl border border-border bg-white px-4 text-sm outline-none focus:border-brand/40"
        />
        {user ? (
          <>
            <Link href="/account" className="rounded-xl border border-border bg-white px-3 py-2 text-sm">{user.name}</Link>
            <button onClick={logout} className="rounded-xl border border-border bg-white px-3 py-2 text-sm">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-xl border border-border bg-white px-3 py-2 text-sm">Login</Link>
            <Link href="/register" className="rounded-xl bg-brand px-3 py-2 text-sm text-white">Register</Link>
          </>
        )}
        <Link href="/cart" className="rounded-xl border border-border bg-white px-3 py-2 text-sm">Cart ({count})</Link>
      </div>
      <nav className="border-t border-border/70 bg-white/70">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 md:px-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${pathname === l.href ? "bg-brand-soft text-slate-900" : "text-slate-700 hover:bg-brand-soft"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

