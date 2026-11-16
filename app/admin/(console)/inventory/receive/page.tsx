import Link from "next/link";
import { requireAdminRole } from "@/lib/admin/auth";
import { listSellableProducts } from "@/lib/admin/queries";
import { receiveStock } from "../../../actions";
import { ActionForm } from "../../../_components/FormError";
import { cardClass, fieldClass, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";

export default async function ReceiveStockPage({
  searchParams,
}: {
  searchParams: Promise<{ product_id?: string }>;
}) {
  await requireAdminRole();
  const params = await searchParams;
  const products = listSellableProducts();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className={cardClass}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Receive incoming stock</h1>
        <p className="mt-2 text-sm text-slate-600">Creates a new INVENTORY batch and updates the product’s aggregate stock.</p>
        <ActionForm action={receiveStock} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Product
            <select name="product_id" defaultValue={params.product_id ?? ""} className={fieldClass} required>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Batch number
            <input name="batch_number" className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Quantity
            <input name="stock_quantity" type="number" min="1" step="1" className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Expiry date
            <input name="expiry_date" type="date" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Reorder level
            <input name="reorder_level" type="number" min="0" step="1" defaultValue={10} className={fieldClass} required />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtnClass}>
              Receive stock
            </button>
            <Link href="/admin/inventory" className={secondaryBtnClass}>
              Cancel
            </Link>
          </div>
        </ActionForm>
      </div>
    </main>
  );
}
