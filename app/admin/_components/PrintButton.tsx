"use client";

import { secondaryBtnClass } from "@/lib/admin/format";

export function PrintButton() {
  return (
    <button type="button" className={`${secondaryBtnClass} print:hidden`} onClick={() => window.print()}>
      Print receipt
    </button>
  );
}
