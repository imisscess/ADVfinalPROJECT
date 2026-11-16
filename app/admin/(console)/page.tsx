import Link from "next/link";
import { requireAdminSession, isAdminRole } from "@/lib/admin/auth";
import { getDashboardData } from "@/lib/admin/queries";
import { cardClass, formatDate, formatDateTime, peso, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";
import { AlertBanner, EmptyState, StatusPill } from "../_components/AdminUi";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={cardClass}>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;
  const data = getDashboardData();
  const maxTotal = Math.max(1, ...data.salesByDay.map((row) => Number(row.total)));
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    const found = data.salesByDay.find((row) => row.day === key);
    return { key, label: `${date.getMonth() + 1}/${date.getDate()}`, total: Number(found?.total ?? 0) };
  });

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Live pharmacy operations from the current database.</p>
        </div>
      </div>

      {params.denied ? (
        <div className="mt-4">
          <AlertBanner>That area is limited to administrators.</AlertBanner>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered users" value={String(data.totalUsers)} />
        <StatCard label="Active products" value={String(data.activeProducts)} />
        <StatCard label="Sales transactions" value={String(data.totalSales)} />
        <StatCard label="Sales revenue" value={peso(data.revenue)} hint="Includes recorded sale totals" />
        <StatCard label="Low-stock products" value={String(data.lowStock)} />
        <StatCard label="Out of stock" value={String(data.outOfStock)} />
        <StatCard
          label="Expiry alerts"
          value={String(data.expiryAlerts)}
          hint="Expired or within 30 days"
        />
      </div>

      <section className={`${cardClass} mt-6`}>
        <h2 className="text-lg font-semibold text-slate-900">Sales overview (14 days)</h2>
        {days.every((day) => day.total === 0) ? (
          <div className="mt-4">
            <EmptyState title="No sales yet" body="Record a sale to populate this chart from actual transactions." />
          </div>
        ) : (
          <div className="mt-5 flex h-44 items-end gap-1">
            {days.map((day) => (
              <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t-xl bg-brand"
                  style={{ height: `${Math.max(6, (day.total / maxTotal) * 100)}%` }}
                  title={`${day.key}: ${peso(day.total)}`}
                />
                <span className="text-[10px] text-slate-500">{day.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={`${cardClass} mt-6`}>
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {isAdminRole(session.role) ? (
            <Link href="/admin/products/new" className={primaryBtnClass}>
              Add product
            </Link>
          ) : null}
          <Link href="/admin/sales/new" className={primaryBtnClass}>
            Record sale
          </Link>
          <Link href="/admin/inventory" className={secondaryBtnClass}>
            View inventory
          </Link>
          {isAdminRole(session.role) ? (
            <Link href="/admin/users" className={secondaryBtnClass}>
              User management
            </Link>
          ) : null}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Recent sales</h2>
            <Link href="/admin/sales" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </div>
          {data.recentSales.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No transactions" body="New receipts will appear here after a sale is recorded." />
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
                        <Link href={`/admin/sales/${sale.sale_id}`} className="font-semibold text-brand">
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

        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Low-stock alerts</h2>
            <Link href="/admin/products?stock=low" className="text-sm font-semibold text-brand">
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
                <li key={product.product_id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-sm">
                  <div>
                    <Link href={`/admin/products/${product.product_id}`} className="font-semibold text-slate-900">
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

        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Expiration alerts</h2>
            <Link href="/admin/inventory?expiry=near" className="text-sm font-semibold text-brand">
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
                  <div className="font-semibold text-slate-900">{batch.product_name}</div>
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
            <h2 className="text-lg font-semibold text-slate-900">Recent audit activity</h2>
            {isAdminRole(session.role) ? (
              <Link href="/admin/audit" className="text-sm font-semibold text-brand">
                View logs
              </Link>
            ) : null}
          </div>
          {data.recentAudit.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No activity yet" body="Administrative actions will be recorded automatically." />
            </div>
          ) : (
            <ul className="mt-4 grid gap-3">
              {data.recentAudit.map((log) => (
                <li key={log.log_id} className="rounded-2xl bg-surface px-4 py-3 text-sm">
                  <div className="font-semibold text-slate-900">
                    {log.action} · {log.table_name}
                  </div>
                  <div className="text-slate-600">{log.description}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {log.full_name || "System"} · {formatDateTime(log.created_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
