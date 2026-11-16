import { requireAdminSession } from "@/lib/admin/auth";
import { listSellableProducts } from "@/lib/admin/queries";
import { cardClass } from "@/lib/admin/format";
import { SaleForm } from "../../../_components/SaleForm";

export default async function NewSalePage() {
  await requireAdminSession();
  const products = listSellableProducts();

  return (
    <main className="mx-auto w-full max-w-4xl">
      <div className={cardClass}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Record sale</h1>
        <p className="mt-2 text-sm text-slate-600">
          Quantities are deducted from unexpired batches using FEFO. Historical unit prices are stored on the sale items.
        </p>
        <div className="mt-6">
          <SaleForm products={products} />
        </div>
      </div>
    </main>
  );
}
