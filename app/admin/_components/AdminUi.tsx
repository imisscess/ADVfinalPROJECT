import Link from "next/link";
import { cardClass, fieldClass, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <form method="get" className={`${cardClass} mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-5`}>
      {children}
    </form>
  );
}

export function FilterSubmit() {
  return (
    <button type="submit" className={`${primaryBtnClass} w-full`}>
      Apply filters
    </button>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-slate-600">
      <div className="font-semibold text-slate-900">{title}</div>
      <p className="mt-1">{body}</p>
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  href,
}: {
  page: number;
  pageSize: number;
  total: number;
  href: (nextPage: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span>
        Page {page} of {pages} · {total} records
      </span>
      <div className="flex gap-2">
        <Link
          href={href(Math.max(1, page - 1))}
          className={`${secondaryBtnClass} h-10 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Previous
        </Link>
        <Link
          href={href(Math.min(pages, page + 1))}
          className={`${secondaryBtnClass} h-10 ${page >= pages ? "pointer-events-none opacity-50" : ""}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

export function StatusPill({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-brand-soft text-slate-900" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function AlertBanner({ children, tone = "warn" }: { children: React.ReactNode; tone?: "warn" | "info" }) {
  return (
    <div
      className={`rounded-2xl border p-3 text-sm ${
        tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-950" : "border-border bg-surface text-slate-700"
      }`}
    >
      {children}
    </div>
  );
}

export { cardClass, fieldClass, primaryBtnClass, secondaryBtnClass };
