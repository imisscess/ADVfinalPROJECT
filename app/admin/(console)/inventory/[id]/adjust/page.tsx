import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin/auth";
import { getInventoryBatch } from "@/lib/admin/queries";
import { adjustStock } from "../../../../actions";
import { ActionForm } from "../../../../_components/FormError";
import { cardClass, fieldClass, formatDate, primaryBtnClass, secondaryBtnClass } from "@/lib/admin/format";

export default async function AdjustStockPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminRole();
  const { id } = await params;
  const batch = getInventoryBatch(Number(id));
  if (!batch) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className={cardClass}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Adjust stock</h1>
        <p className="mt-2 text-sm text-slate-600">
          {batch.product_name} · batch {batch.batch_number || "—"} · expiry {formatDate(batch.expiry_date)}. Current quantity{" "}
          {batch.stock_quantity}.
        </p>
        <ActionForm action={adjustStock} className="mt-6 grid gap-4">
          <input type="hidden" name="inventory_id" value={batch.inventory_id} />
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            New quantity
            <input
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              defaultValue={batch.stock_quantity}
              className={fieldClass}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Reorder level
            <input
              name="reorder_level"
              type="number"
              min="0"
              step="1"
              defaultValue={batch.reorder_level}
              className={fieldClass}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">
            Reason
            <textarea name="reason" rows={4} className={`${fieldClass} h-auto py-3`} required />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryBtnClass}>
              Save adjustment
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
