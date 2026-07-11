"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export interface LeadExportButtonProps {
  exportCsv: () => Promise<string>;
}

/** Downloads the CSV a Server Action computed — no dedicated download route, per `actions/studio/leads.ts`'s `exportLeadsCsv` comment. */
export function LeadExportButton({ exportCsv }: LeadExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const csv = await exportCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      isLoading={isPending}
      onClick={handleExport}
    >
      Export CSV
    </Button>
  );
}
