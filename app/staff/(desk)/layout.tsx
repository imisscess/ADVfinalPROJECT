import Link from "next/link";
import { requireStaffSession } from "@/lib/admin/auth";
import { isAdminRole } from "@/lib/admin/types";
import { logoutAdmin } from "@/app/admin/actions";
import { secondaryBtnClass } from "@/lib/admin/format";
import { StaffNav } from "../_components/StaffNav";

const links = [
  { href: "/staff", label: "Desk" },
  { href: "/staff/products", label: "Products" },
  { href: "/staff/inventory", label: "Inventory" },
  { href: "/staff/sales", label: "Sales" },
];

export default async function StaffDeskLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffSession();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-64">
        <div className="rounded-3xl border border-border bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:sticky lg:top-6">
          <Link href="/staff" className="font-semibold text-slate-900">
            301 EAST Staff
          </Link>
          <p className="mt-1 text-sm text-slate-600">
            {session.full_name}
            <span className="mt-1 block text-xs uppercase tracking-wide text-slate-500">{session.role}</span>
          </p>
          <StaffNav links={links} />
          <div className="mt-5 grid gap-2">
            {isAdminRole(session.role) ? (
              <Link href="/admin" className={`${secondaryBtnClass} h-10 text-sm`}>
                Admin console
              </Link>
            ) : null}
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
