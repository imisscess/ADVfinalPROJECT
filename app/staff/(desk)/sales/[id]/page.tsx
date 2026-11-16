import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffSession } from "@/lib/admin/auth";
import { getSale } from "@/lib/admin/queries";
import { cardClass, formatDateTime, peso, secondaryBtnClass } from "@/lib/admin/format";
import { PrintButton } from "@/app/admin/_components/PrintButton";

export default async function StaffSaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffSession();
  const { id } = await params;
  const data = getSale(Number(id));
  if (!data) notFound();
  const { sale, items } = data;

  return (
    <main className="mx-auto w-full max-w-3xl">
      <div className={`${cardClass} print:border-slate-200 print:shadow-none`}>
        <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sale {sale.receipt_no}</h1>
            <p className="mt-1 text-sm text-slate-600">{formatDateTime(sale.sale_date)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrintButton />
            <Link href="/staff/sales" className={secondaryBtnClass}>
              Back
            </Link>
          </div>
        </div>

        <div className="hidden print:block">
          <div className="text-lg font-semibold">301 EAST Drugstore</div>
          <div className="text-sm text-slate-600">Official receipt</div>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Receipt no.</dt>
            <dd className="mt-1 font-semibold text-slate-900">{sale.receipt_no}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Processed by</dt>
            <dd className="mt-1 font-semibold text-slate-900">{sale.cashier_name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Customer ID</dt>
            <dd className="mt-1 font-semibold text-slate-900">{sale.customer_id || "Walk-in"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Payment</dt>
            <dd className="mt-1 font-semibold capitalize text-slate-900">
              {sale.payment_method} · {sale.payment_status}
            </dd>
          </div>
        </dl>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium">Qty</th>
                <th className="pb-2 font-medium">Unit price</th>
                <th className="pb-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.sale_item_id} className="border-t border-border">
                  <td className="py-3">{item.product_name}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">{peso(item.unit_price)}</td>
                  <td className="py-3">{peso(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right text-lg font-semibold text-slate-900">Total {peso(sale.total_amount)}</div>
      </div>
    </main>
  );
}
