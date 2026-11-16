import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { getProduct } from "@/lib/admin/queries";
import { updateProduct } from "../../../../actions";
import { ActionForm } from "../../../../_components/FormError";
import { cardClass, fieldClass, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminRole();
  const { id } = await params;
  const product = getProduct(Number(id));
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className={cardClass}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit product</h1>
        <p className="mt-2 text-sm text-slate-600">
          Stock quantity is maintained from inventory batches and is not edited here.
        </p>
        <ActionForm action={updateProduct} className="mt-6 grid gap-4">
          <input type="hidden" name="product_id" value={product.product_id} />
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Product name
            <input name="product_name" defaultValue={product.product_name} className={fieldClass} required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Generic name
            <input name="generic_name" defaultValue={product.generic_name ?? ""} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Category
            <input name="category" defaultValue={product.category ?? ""} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Unit price
            <input
              name="unit_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product.unit_price}
              className={fieldClass}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Barcode
            <input name="barcode" defaultValue={product.barcode ?? ""} className={fieldClass} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={product.description ?? ""}
              className={`${fieldClass} h-auto py-3`}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtnClass}>
              Save changes
            </button>
            <Link href={`/admin/products/${product.product_id}`} className={secondaryBtnClass}>
              Cancel
            </Link>
          </div>
        </ActionForm>
      </div>
    </main>
  );
}
