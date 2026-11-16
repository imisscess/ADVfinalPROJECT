"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import type { ProductRow } from "@/lib/admin/queries";
import { fieldClass, primaryBtnClass, secondaryBtnClass, peso } from "@/lib/admin/format";
import { recordSale, type ActionState } from "../actions";
import { AlertBanner } from "./AdminUi";

type Line = { key: string; product_id: string; quantity: string };

export function SaleForm({ products }: { products: ProductRow[] }) {
  const [lines, setLines] = useState<Line[]>([{ key: "1", product_id: "", quantity: "1" }]);
  const [state, formAction, pending] = useActionState(recordSale, null as ActionState | null);

  const payload = useMemo(
    () =>
      JSON.stringify(
        lines
          .filter((line) => line.product_id)
          .map((line) => ({ product_id: Number(line.product_id), quantity: Number(line.quantity) })),
      ),
    [lines],
  );

  const preview = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = products.find((item) => String(item.product_id) === line.product_id);
      const qty = Number(line.quantity);
      if (!product || !Number.isFinite(qty)) return sum;
      return sum + product.unit_price * qty;
    }, 0);
  }, [lines, products]);

  return (
    <form action={formAction} className="grid gap-4">
      {state?.error ? <AlertBanner>{state.error}</AlertBanner> : null}
      <input type="hidden" name="lines" value={payload} />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Customer ID
          <input name="customer_id" placeholder="Optional walk-in reference" className={fieldClass} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Payment method
          <select name="payment_method" defaultValue="cash" className={fieldClass}>
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
            <option value="card">Card</option>
            <option value="bank">Bank transfer</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Payment status
          <select name="payment_status" defaultValue="paid" className={fieldClass}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
      </div>
      <p className="text-xs text-slate-500">
        Customer ID is stored as entered. There is no customer table in this schema, so it is not linked to USERS.
      </p>

      <div className="grid gap-3">
        {lines.map((line, index) => {
          const product = products.find((item) => String(item.product_id) === line.product_id);
          return (
            <div key={line.key} className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[1fr_140px_auto]">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Product {index + 1}
                <select
                  value={line.product_id}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key ? { ...item, product_id: event.target.value } : item,
                      ),
                    )
                  }
                  className={fieldClass}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((item) => (
                    <option key={item.product_id} value={item.product_id}>
                      {item.product_name} · stock {item.stock_quantity} · {peso(item.unit_price)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Quantity
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={line.quantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key ? { ...item, quantity: event.target.value } : item,
                      ),
                    )
                  }
                  className={fieldClass}
                  required
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}
                  disabled={lines.length === 1}
                >
                  Remove
                </button>
              </div>
              {product ? (
                <p className="md:col-span-3 text-xs text-slate-600">
                  Line total {peso(product.unit_price * Number(line.quantity || 0))}. Unexpired batches are allocated FEFO on save.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() =>
            setLines((current) => [...current, { key: String(Date.now()), product_id: "", quantity: "1" }])
          }
        >
          Add item
        </button>
        <div className="text-sm font-semibold text-slate-900">Estimated total {peso(preview)}</div>
      </div>

      <button type="submit" disabled={pending} className={primaryBtnClass}>
        {pending ? "Recording sale…" : "Record sale"}
      </button>
    </form>
  );
}
