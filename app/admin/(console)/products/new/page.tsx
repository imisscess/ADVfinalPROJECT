import Link from "next/link";
import { requireAdminRole } from "@/lib/admin/auth";
import { createProduct } from "../../../actions";
import { ActionForm } from "../../../_components/FormError";
import { cardClass, fieldClass, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";

export default async function NewProductPage() {
  await requireAdminRole();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className={cardClass}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add product</h1>
        <p className="mt-2 text-sm text-slate-600">
          Stock starts at 0. Receive an inventory batch after saving so PRODUCTS.stock_quantity stays accurate.
        </p>
        <ActionForm action={createProduct} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Product name
            <input name="product_name" className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Generic name
            <input name="generic_name" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Category
            <input name="category" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Unit price
            <input name="unit_price" type="number" min="0" step="0.01" className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Barcode
            <input name="barcode" className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Description
            <textarea name="description" rows={4} className={`${fieldClass} h-auto py-3`} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtnClass}>
              Save product
            </button>
            <Link href="/admin/products" className={secondaryBtnClass}>
              Cancel
            </Link>
          </div>
        </ActionForm>
      </div>
    </main>
  );
}
