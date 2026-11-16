import Link from "next/link";
import { requireStaffSession } from "@/lib/admin/auth";
import { listInventory } from "@/lib/admin/queries";
import { cardClass, fieldClass, formatDate, formatDateTime } from "@/lib/admin/format";
import { EmptyState, FilterBar, FilterSubmit, Pagination } from "@/app/admin/_components/AdminUi";

export default async function StaffInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stock?: string; expiry?: string; page?: string }>;
}) {
  await requireStaffSession();
  const params = await searchParams;
  const data = listInventory({
    q: params.q,
    stock: params.stock,
    expiry: params.expiry,
    page: Number(params.page || 1),
  });

  return (
    <main>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventory</h1>
        <p className="mt-1 text-sm text-slate-600">
          Batch-level stock and expiration dates. Expired batches cannot be sold.
        </p>
      </div>

      <FilterBar>
        <input type="hidden" name="page" value="1" />
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Search
          <input name="q" defaultValue={params.q ?? ""} placeholder="Product or batch number" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Stock
          <select name="stock" defaultValue={params.stock ?? "all"} className={fieldClass}>
            <option value="all">All</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Expiry
          <select name="expiry" defaultValue={params.expiry ?? "all"} className={fieldClass}>
            <option value="all">All</option>
            <option value="near">Near expiry</option>
            <option value="expired">Expired</option>
          </select>
        </label>
        <div className="flex items-end">
          <FilterSubmit />
        </div>
      </FilterBar>

      <section className={`${cardClass} mt-6 overflow-x-auto`}>
        {data.rows.length === 0 ? (
          <EmptyState title="No batches found" body="Change the search or expiry filter." />
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Batch</th>
                <th className="pb-3 font-medium">Qty</th>
                <th className="pb-3 font-medium">Expiry</th>
                <th className="pb-3 font-medium">Reorder</th>
                <th className="pb-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((batch) => {
                const expired = batch.expiry_date && batch.expiry_date < new Date().toISOString().slice(0, 10);
                const low = batch.stock_quantity > 0 && batch.stock_quantity <= batch.reorder_level;
                return (
                  <tr key={batch.inventory_id} className="border-t border-border">
                    <td className="py-3">
                      <Link href={`/staff/products/${batch.product_id}`} className="font-semibold text-brand">
                        {batch.product_name}
                      </Link>
                    </td>
                    <td className="py-3">{batch.batch_number || "—"}</td>
                    <td className="py-3">
                      {batch.stock_quantity}
                      {low ? <div className="text-xs font-semibold text-amber-800">Low stock</div> : null}
                    </td>
                    <td className="py-3">
                      {formatDate(batch.expiry_date)}
                      {expired ? <div className="text-xs font-semibold text-amber-800">Expired</div> : null}
                    </td>
                    <td className="py-3">{batch.reorder_level}</td>
                    <td className="py-3 text-slate-600">{formatDateTime(batch.updated_at)}</td>
                  </tr>
                );
              })}
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
            if (params.stock) search.set("stock", params.stock);
            if (params.expiry) search.set("expiry", params.expiry);
            search.set("page", String(next));
            return `/staff/inventory?${search.toString()}`;
          }}
        />
      </section>
    </main>
  );
}
