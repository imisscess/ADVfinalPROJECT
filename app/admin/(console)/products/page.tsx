import Link from "next/link";
import { requireAdminSession, isAdminRole } from "@/lib/admin/auth";
import { listProducts, productCategories } from "@/lib/admin/queries";
import { cardClass, fieldClass, peso, primaryBtnClass } from "@/lib/admin/format";
import { EmptyState, FilterBar, FilterSubmit, Pagination, StatusPill } from "../../_components/AdminUi";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; stock?: string; page?: string }>;
}) {
  const session = await requireAdminSession();
  const params = await searchParams;
  const data = listProducts({
    q: params.q,
    category: params.category,
    status: params.status,
    stock: params.stock,
    page: Number(params.page || 1),
  });
  const categories = productCategories();

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Product management</h1>
          <p className="mt-1 text-sm text-slate-600">
            PRODUCTS table with live stock totals. Low-stock warnings use each product’s reorder level.
          </p>
        </div>
        {isAdminRole(session.role) ? (
          <Link href="/admin/products/new" className={primaryBtnClass}>
            Add product
          </Link>
        ) : null}
      </div>

      <FilterBar>
        <input type="hidden" name="page" value="1" />
        <label className="grid gap-2 text-sm font-semibold text-slate-800 md:col-span-2">
          Search
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Name, generic name, or barcode"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Category
          <select name="category" defaultValue={params.category ?? "all"} className={fieldClass}>
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.category} value={item.category}>
                {item.category}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Status
          <select name="status" defaultValue={params.status ?? "all"} className={fieldClass}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Stock
          <select name="stock" defaultValue={params.stock ?? "all"} className={fieldClass}>
            <option value="all">All stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </label>
        <div className="flex items-end">
          <FilterSubmit />
        </div>
      </FilterBar>

      <section className={`${cardClass} mt-6 overflow-x-auto`}>
        {data.rows.length === 0 ? (
          <EmptyState title="No products found" body="Adjust filters or add a product." />
        ) : (
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((product) => {
                const warning =
                  product.stock_quantity <= 0 ? "Out of stock" : product.stock_quantity <= product.reorder_level ? "Low stock" : null;
                return (
                  <tr key={product.product_id} className="border-t border-border">
                    <td className="py-3">
                      <Link href={`/admin/products/${product.product_id}`} className="font-semibold text-brand">
                        {product.product_name}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {product.generic_name || "—"} · {product.barcode || "No barcode"}
                      </div>
                    </td>
                    <td className="py-3">{product.category || "—"}</td>
                    <td className="py-3">{peso(product.unit_price)}</td>
                    <td className="py-3">
                      {product.stock_quantity}
                      {warning ? <div className="text-xs font-semibold text-amber-800">{warning}</div> : null}
                    </td>
                    <td className="py-3">
                      <StatusPill active={Boolean(product.is_active)} />
                    </td>
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
            if (params.category) search.set("category", params.category);
            if (params.status) search.set("status", params.status);
            if (params.stock) search.set("stock", params.stock);
            search.set("page", String(next));
            return `/admin/products?${search.toString()}`;
          }}
        />
      </section>
    </main>
  );
}
