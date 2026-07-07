"use client";

import { useState } from "react";
import { CrmRecord, SkippedRow } from "@/lib/types";

const CRM_COLUMNS: (keyof CrmRecord)[] = [
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "crm_status",
  "data_source",
  "crm_note",
];

type Props = {
  imported: CrmRecord[];
  skipped: SkippedRow[];
};

export default function ResultTable({ imported, skipped }: Props) {
  const [tab, setTab] = useState<"imported" | "skipped">("imported");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <TabButton
          active={tab === "imported"}
          onClick={() => setTab("imported")}
          label={`Imported (${imported.length})`}
          tone="accent"
        />
        <TabButton
          active={tab === "skipped"}
          onClick={() => setTab("skipped")}
          label={`Skipped (${skipped.length})`}
          tone="warn"
        />
      </div>

      {tab === "imported" ? (
        <div className="max-h-[420px] overflow-auto rounded-xl border border-ink/10">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-ink text-white">
              <tr>
                {CRM_COLUMNS.map((c) => (
                  <th key={c} className="whitespace-nowrap px-4 py-3 text-left font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {imported.map((record, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-canvas"}>
                  {CRM_COLUMNS.map((c) => (
                    <td key={c} className="whitespace-nowrap px-4 py-2.5 text-ink/80">
                      {record[c] || <span className="text-ink/25">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-auto rounded-xl border border-ink/10">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-ink text-white">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Reason skipped</th>
                <th className="px-4 py-3 text-left font-medium">Original row</th>
              </tr>
            </thead>
            <tbody>
              {skipped.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-canvas"}>
                  <td className="px-4 py-2.5 font-medium text-amber-700">{s.reason}</td>
                  <td className="px-4 py-2.5 text-ink/60">
                    {JSON.stringify(s.original_row)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone: "accent" | "warn";
}) {
  const activeClass =
    tone === "accent" ? "bg-accent text-white" : "bg-amber-500 text-white";
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active ? activeClass : "bg-ink/5 text-ink/60 hover:bg-ink/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
