import { RawCsvRow } from "@/lib/types";

type Props = {
  headers: string[];
  rows: RawCsvRow[];
};

// Shows the raw, unprocessed CSV exactly as uploaded. Sticky header +
// both-axis scroll so wide/long exports (Facebook exports especially,
// which can have 30+ columns) stay usable.
export default function PreviewTable({ headers, rows }: Props) {
  return (
    <div className="max-h-[420px] overflow-auto rounded-xl border border-ink/10">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-ink text-white">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-3 text-left font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white" : "bg-canvas"}
            >
              {headers.map((h) => (
                <td
                  key={h}
                  className="whitespace-nowrap px-4 py-2.5 text-ink/80"
                >
                  {row[h] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
