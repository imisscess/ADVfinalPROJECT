import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession, isAdminRole } from "@/lib/admin/auth";
import { getProduct, getProductBatches } from "@/lib/admin/queries";
import { setProductActive } from "../../../actions";
import { cardClass, formatDate, formatDateTime, peso, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";
import { ConfirmSubmit } from "../../../_components/ConfirmSubmit";
import { EmptyState, StatusPill } from "../../../_components/AdminUi";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  const { id } = await params;
  const product = getProduct(Number(id));
  if (!product) notFound();
  const batches = getProductBatches(product.product_id);
  const warning =
    product.stock_quantity <= 0 ? "Out of stock" : product.stock_quantity <= product.reorder_level ? "Low stock" : null;

  return (
    <main className="grid gap-6">
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{product.product_name}</h1>
            <p className="mt-1 text-sm text-slate-600">{product.generic_name || "No generic name"}</p>
          </div>
          <StatusPill active={Boolean(product.is_active)} />
        </div>
        {warning ? <p className="mt-4 text-sm font-semibold text-amber-800">{warning}</p> : null}
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Category</dt>
            <dd className="mt-1 font-semibold text-slate-900">{product.category || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Unit price</dt>
            <dd className="mt-1 font-semibold text-slate-900">{peso(product.unit_price)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Available stock</dt>
            <dd className="mt-1 font-semibold text-slate-900">{product.stock_quantity}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Barcode</dt>
            <dd className="mt-1 font-semibold text-slate-900">{product.barcode || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Description</dt>
            <dd className="mt-1 text-slate-900">{product.description || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Created</dt>
            <dd className="mt-1">{formatDateTime(product.created_at)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Updated</dt>
            <dd className="mt-1">{formatDateTime(product.updated_at)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          {isAdminRole(session.role) ? (
            <>
              <Link href={`/admin/products/${product.product_id}/edit`} className={primaryBtnClass}>
                Edit product
              </Link>
              <ConfirmSubmit
                action={setProductActive}
                message={product.is_active ? "Deactivate this product?" : "Activate this product?"}
                label={product.is_active ? "Deactivate" : "Activate"}
                className={secondaryBtnClass}
                fields={{ product_id: String(product.product_id), is_active: product.is_active ? "0" : "1" }}
              />
              <Link href={`/admin/inventory/receive?product_id=${product.product_id}`} className={secondaryBtnClass}>
                Receive stock
              </Link>
            </>
          ) : null}
          <Link href="/admin/products" className={secondaryBtnClass}>
            Back
          </Link>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-slate-900">Inventory batches</h2>
        {batches.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No batches" body="Receive incoming stock to create the first batch for this product." />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Batch</th>
                  <th className="pb-2 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Expiry</th>
                  <th className="pb-2 font-medium">Reorder</th>
                  <th className="pb-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.inventory_id} className="border-t border-border">
                    <td className="py-3">{batch.batch_number || "—"}</td>
                    <td className="py-3">{batch.stock_quantity}</td>
                    <td className="py-3">{formatDate(batch.expiry_date)}</td>
                    <td className="py-3">{batch.reorder_level}</td>
                    <td className="py-3 text-slate-600">{formatDateTime(batch.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
