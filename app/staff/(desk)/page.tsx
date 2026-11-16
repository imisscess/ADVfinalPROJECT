import Link from "next/link";
import { requireStaffSession } from "@/lib/admin/auth";
import { getStaffDeskData } from "@/lib/admin/queries";
import { cardClass, fieldClass, formatDate, formatDateTime, peso, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";
import { AlertBanner, EmptyState, StatusPill } from "@/app/admin/_components/AdminUi";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={cardClass}>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export default async function StaffDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const session = await requireStaffSession();
  const params = await searchParams;
  const data = getStaffDeskData(session.id);

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pharmacy desk</h1>
          <p className="mt-1 text-sm text-slate-600">
            Hello, {session.full_name}. Look up products, watch expiry dates, and help record sales.
          </p>
        </div>
        <Link href="/staff/sales/new" className={primaryBtnClass}>
          Record a sale
        </Link>
      </div>

      {params.denied ? (
        <div className="mt-4">
          <AlertBanner>That tool is limited to administrators. You can keep using the pharmacy desk.</AlertBanner>
        </div>
      ) : null}

      <form action="/staff/products" className={`${cardClass} mt-6 grid gap-3 sm:grid-cols-[1fr_auto]`}>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Find a product
          <input name="q" placeholder="Name, generic name, or barcode" className={fieldClass} />
        </label>
        <div className="flex items-end">
          <button type="submit" className={primaryBtnClass}>
            Search
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active products" value={String(data.activeProducts)} />
        <StatCard label="Today’s sales" value={String(data.todayCount)} hint={peso(data.todayTotal)} />
        <StatCard label="Low stock" value={String(data.lowStock)} />
        <StatCard label="Expiry alerts" value={String(data.expiryAlerts)} hint="Expired or within 30 days" />
      </div>

      <section className={`${cardClass} mt-6`}>
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/staff/sales/new" className={primaryBtnClass}>
            Record sale
          </Link>
          <Link href="/staff/products" className={secondaryBtnClass}>
            Product list
          </Link>
          <Link href="/staff/inventory?expiry=near" className={secondaryBtnClass}>
            Near-expiry batches
          </Link>
          <Link href="/staff/inventory?stock=low" className={secondaryBtnClass}>
            Low stock
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          You recorded {data.myTodayCount} sale{data.myTodayCount === 1 ? "" : "s"} today
          {data.myTodayCount ? ` (${peso(data.myTodayTotal)})` : ""}. User management stays in the admin console.
        </p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Expiration alerts</h2>
            <Link href="/staff/inventory?expiry=near" className="text-sm font-semibold text-brand">
              Inventory
            </Link>
          </div>
          {data.expiryList.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No near-term expiry" body="No batches are expired or due within 30 days." />
            </div>
          ) : (
            <ul className="mt-4 grid gap-3">
              {data.expiryList.map((batch) => (
                <li key={batch.inventory_id} className="rounded-2xl bg-surface px-4 py-3 text-sm">
                  <Link href={`/staff/products/${batch.product_id}`} className="font-semibold text-slate-900">
                    {batch.product_name}
                  </Link>
                  <div className="text-slate-600">
                    Batch {batch.batch_number || "—"} · {batch.stock_quantity} units · {formatDate(batch.expiry_date)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Low-stock alerts</h2>
            <Link href="/staff/products?stock=low" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </div>
          {data.lowStockList.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="Stock looks healthy" body="No active products are at or below their reorder level." />
            </div>
          ) : (
            <ul className="mt-4 grid gap-3">
              {data.lowStockList.map((product) => (
                <li
                  key={product.product_id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-sm"
                >
                  <div>
                    <Link href={`/staff/products/${product.product_id}`} className="font-semibold text-slate-900">
                      {product.product_name}
                    </Link>
                    <div className="text-slate-600">
                      {product.stock_quantity} on hand · reorder {product.reorder_level}
                    </div>
                  </div>
                  <StatusPill active={product.stock_quantity > 0} activeLabel="Low" inactiveLabel="Out" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${cardClass} xl:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Recent sales</h2>
            <Link href="/staff/sales" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </div>
          {data.recentSales.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No transactions yet" body="Record a sale to help a customer at the counter." />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-2 font-medium">Receipt</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Staff</th>
                    <th className="pb-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSales.map((sale) => (
                    <tr key={sale.sale_id} className="border-t border-border">
                      <td className="py-3">
                        <Link href={`/staff/sales/${sale.sale_id}`} className="font-semibold text-brand">
                          {sale.receipt_no}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-600">{formatDateTime(sale.sale_date)}</td>
                      <td className="py-3">{sale.cashier_name}</td>
                      <td className="py-3">{peso(sale.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
