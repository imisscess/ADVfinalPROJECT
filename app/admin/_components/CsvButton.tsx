"use client";

import { useState } from "react";
import { exportReportCsv } from "../actions";
import { secondaryBtnClass } from "@/lib/admin/format";

export function CsvButton({
  kind,
  from,
  to,
  label,
}: {
  kind: string;
  from: string;
  to: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className={secondaryBtnClass}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const csv = await exportReportCsv(kind, from, to);
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${kind}-${from}-to-${to}.csv`;
          link.click();
          URL.revokeObjectURL(url);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Exporting…" : label}
    </button>
  );
}
