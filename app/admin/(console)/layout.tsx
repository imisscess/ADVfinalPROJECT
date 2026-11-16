import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession, isAdminRole } from "@/lib/admin/auth";
import { logoutAdmin } from "../actions";
import { secondaryBtnClass } from "@/lib/admin/format";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users", admin: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/sales", label: "Sales" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/audit", label: "Audit logs", admin: true },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  if (!isAdminRole(session.role)) redirect("/staff");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-64">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:sticky lg:top-6">
          <Link href="/admin" className="font-semibold text-slate-900">
            301 EAST Admin
          </Link>
          <p className="mt-1 text-sm text-slate-600">
            {session.full_name}
            <span className="mt-1 block text-xs uppercase tracking-wide text-slate-500">{session.role}</span>
          </p>
          <nav className="mt-5 grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-3 py-2 text-sm text-slate-700 hover:bg-brand-soft"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 grid gap-2">
            <Link href="/staff" className={`${secondaryBtnClass} h-10 text-sm`}>
              Staff desk
            </Link>
            <Link href="/" className={`${secondaryBtnClass} h-10 text-sm`}>
              Storefront
            </Link>
            <form action={logoutAdmin}>
              <button type="submit" className={`${secondaryBtnClass} h-10 w-full text-sm`}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
