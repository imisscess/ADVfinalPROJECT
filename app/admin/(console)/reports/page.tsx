import { requireAdminSession } from "@/lib/admin/auth";
import { getReports } from "@/lib/admin/queries";
import { cardClass, fieldClass, formatDate, formatDateTime, peso, primaryBtnClass } from "@/lib/admin/format";
import { EmptyState } from "../../_components/AdminUi";
import { CsvButton } from "../../_components/CsvButton";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const from = params.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = params.to || today;
  const report = getReports({ from, to });

  return (
    <main>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-600">
          Figures are queried from SALES, SALE_ITEMS, PRODUCTS, INVENTORY, and AUDIT_LOGS. Profit is omitted because the schema has no product cost field.
        </p>
      </div>

      <form className={`${cardClass} mt-6 flex flex-wrap items-end gap-3`}>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          From
          <input name="from" type="date" defaultValue={from} className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          To
          <input name="to" type="date" defaultValue={to} className={fieldClass} />
        </label>
        <button type="submit" className={primaryBtnClass}>
          Update report
        </button>
        <CsvButton kind="sales" from={from} to={to} label="Export staff CSV" />
        <CsvButton kind="products" from={from} to={to} label="Export products CSV" />
        <CsvButton kind="stock" from={from} to={to} label="Export stock CSV" />
        <CsvButton kind="expiry" from={from} to={to} label="Export expiry CSV" />
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={cardClass}>
          <div className="text-sm text-slate-600">Transactions</div>
          <div className="mt-2 text-2xl font-semibold">{report.summary.transactions}</div>
        </div>
        <div className={cardClass}>
          <div className="text-sm text-slate-600">Sales total</div>
          <div className="mt-2 text-2xl font-semibold">{peso(report.summary.revenue)}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Sales by payment status</h2>
          {report.byStatus.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No sales in range" body="Choose another date range or record a sale." />
            </div>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Count</th>
                  <th className="pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.byStatus.map((row) => (
                  <tr key={row.payment_status} className="border-t border-border">
                    <td className="py-2 capitalize">{row.payment_status}</td>
                    <td className="py-2">{row.count}</td>
                    <td className="py-2">{peso(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Sales by staff</h2>
          {report.byStaff.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No staff sales" body="Completed transactions will group by processing user." />
            </div>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Staff</th>
                  <th className="pb-2 font-medium">Count</th>
                  <th className="pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.byStaff.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="py-2">{row.full_name}</td>
                    <td className="py-2">{row.count}</td>
                    <td className="py-2">{peso(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Best-selling products</h2>
          {report.bestSellers.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No sold items" body="Sale items in this range will rank here." />
            </div>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {report.bestSellers.map((row) => (
                  <tr key={row.product_id} className="border-t border-border">
                    <td className="py-2">{row.product_name}</td>
                    <td className="py-2">{row.qty}</td>
                    <td className="py-2">{peso(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Low-stock products</h2>
          {report.lowStock.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No low-stock items" body="Active products at or below reorder level will list here." />
            </div>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Reorder</th>
                </tr>
              </thead>
              <tbody>
                {report.lowStock.map((row) => (
                  <tr key={row.product_id} className="border-t border-border">
                    <td className="py-2">{row.product_name}</td>
                    <td className="py-2">{row.stock_quantity}</td>
                    <td className="py-2">{row.reorder_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className={`${cardClass} mt-6 overflow-x-auto`}>
        <h2 className="text-lg font-semibold text-slate-900">Current stock levels</h2>
        <table className="mt-4 w-full min-w-[640px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-2 font-medium">Product</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Stock</th>
              <th className="pb-2 font-medium">Unit price</th>
            </tr>
          </thead>
          <tbody>
            {report.stockLevels.slice(0, 20).map((row) => (
              <tr key={row.product_id} className="border-t border-border">
                <td className="py-2">{row.product_name}</td>
                <td className="py-2">{row.category || "—"}</td>
                <td className="py-2">{row.stock_quantity}</td>
                <td className="py-2">{peso(row.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">Showing 20 products. Export stock CSV for the full list.</p>
      </section>

      <section className={`${cardClass} mt-6 overflow-x-auto`}>
        <h2 className="text-lg font-semibold text-slate-900">Expired and near-expiry batches</h2>
        {report.expiry.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No expiry alerts" body="Batches expiring within 30 days will appear here." />
          </div>
        ) : (
          <table className="mt-4 w-full min-w-[640px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Batch</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {report.expiry.map((row) => (
                <tr key={row.inventory_id} className="border-t border-border">
                  <td className="py-2">{row.product_name}</td>
                  <td className="py-2">{row.batch_number || "—"}</td>
                  <td className="py-2">{row.stock_quantity}</td>
                  <td className="py-2">{formatDate(row.expiry_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={`${cardClass} mt-6`}>
        <h2 className="text-lg font-semibold text-slate-900">Recent administrative activities</h2>
        {report.adminActivity.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No activity in range" body="Audit events in this date range will list here." />
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {report.adminActivity.map((log) => (
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
    </main>
  );
}
