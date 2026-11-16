"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StaffNav({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav className="mt-5 grid gap-1">
      {links.map((link) => {
        const active =
          link.href === "/staff"
            ? pathname === "/staff"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-2xl px-3 py-2 text-sm ${
              active ? "bg-brand-soft font-semibold text-slate-900" : "text-slate-700 hover:bg-brand-soft"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
