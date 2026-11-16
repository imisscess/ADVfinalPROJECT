import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/auth";
import { listSales } from "@/lib/admin/queries";
import { cardClass, fieldClass, formatDateTime, peso, primaryBtnClass } from "@/lib/admin/format";
import { EmptyState, FilterBar, FilterSubmit, Pagination } from "../../_components/AdminUi";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string; status?: string; page?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const data = listSales({
    q: params.q,
    from: params.from,
    to: params.to,
    status: params.status,
    page: Number(params.page || 1),
  });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sales</h1>
          <p className="mt-1 text-sm text-slate-600">SALES and SALE_ITEMS records, including receipt numbers and payment status.</p>
        </div>
        <Link href="/admin/sales/new" className={primaryBtnClass}>
          Record sale
        </Link>
      </div>

      <FilterBar>
        <input type="hidden" name="page" value="1" />
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Search
          <input name="q" defaultValue={params.q ?? ""} placeholder="Receipt, customer ID, staff" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          From
          <input name="from" type="date" defaultValue={params.from ?? ""} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          To
          <input name="to" type="date" defaultValue={params.to ?? ""} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Payment status
          <select name="status" defaultValue={params.status ?? "all"} className={fieldClass}>
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <div className="flex items-end">
          <FilterSubmit />
        </div>
      </FilterBar>

      <section className={`${cardClass} mt-6 overflow-x-auto`}>
        {data.rows.length === 0 ? (
          <EmptyState title="No sales found" body="Record a sale or widen the date range." />
        ) : (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Receipt</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Customer ID</th>
                <th className="pb-3 font-medium">Staff</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Method</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((sale) => (
                <tr key={sale.sale_id} className="border-t border-border">
                  <td className="py-3">
                    <Link href={`/admin/sales/${sale.sale_id}`} className="font-semibold text-brand">
                      {sale.receipt_no}
                    </Link>
                  </td>
                  <td className="py-3 text-slate-600">{formatDateTime(sale.sale_date)}</td>
                  <td className="py-3">{sale.customer_id || "Walk-in"}</td>
                  <td className="py-3">{sale.cashier_name}</td>
                  <td className="py-3">{peso(sale.total_amount)}</td>
                  <td className="py-3 capitalize">{sale.payment_method}</td>
                  <td className="py-3 capitalize">{sale.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          href={(next) => {
            const search = new URLSearchParams();
            if (params.q) search.set("q", params.q);
            if (params.from) search.set("from", params.from);
            if (params.to) search.set("to", params.to);
            if (params.status) search.set("status", params.status);
            search.set("page", String(next));
            return `/admin/sales?${search.toString()}`;
          }}
        />
      </section>
    </main>
  );
}
