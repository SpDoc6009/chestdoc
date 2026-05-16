"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-primary"
    >
      <span className="inline-flex items-center gap-2">
        <Printer className="h-4 w-4" aria-hidden="true" />
        列印 / 另存 PDF
      </span>
    </button>
  );
}
