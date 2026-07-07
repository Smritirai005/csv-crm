"use client";

import { useState } from "react";
import Papa from "papaparse";
import StepIndicator from "@/components/StepIndicator";
import UploadZone from "@/components/UploadZone";
import PreviewTable from "@/components/PreviewTable";
import ResultTable from "@/components/ResultTable";
import { importCsv } from "@/lib/api";
import { ImportResponse, RawCsvRow, Step } from "@/lib/types";

export default function HomePage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RawCsvRow[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);

  // Step 1 -> 2: parse the CSV entirely client-side. No AI, no network call.
  function handleFileSelected(selected: File) {
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setUploadError("Please upload a .csv file.");
      return;
    }
    setUploadError(null);

    Papa.parse<RawCsvRow>(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedHeaders = results.meta.fields || [];
        setFile(selected);
        setHeaders(parsedHeaders);
        setRows(results.data);
        setStep("preview");
      },
      error: (err) => setUploadError(err.message),
    });
  }

  // Step 3: Confirm -> the ONLY point where the backend (and therefore the
  // AI) gets called.
  async function handleConfirm() {
    if (!file) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const response = await importCsv(file);
      setResult(response);
      setStep("result");
    } catch (err: any) {
      setImportError(err.message || "Import failed");
    } finally {
      setIsImporting(false);
    }
  }

  function reset() {
    setStep("upload");
    setFile(null);
    setHeaders([]);
    setRows([]);
    setResult(null);
    setImportError(null);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            GrowEasy CRM
          </p>
          <h1 className="font-display text-3xl font-bold text-ink">
            CSV Lead Importer
          </h1>
        </div>
        <StepIndicator current={step} />
      </header>

      {step === "upload" && (
        <section>
          <UploadZone onFileSelected={handleFileSelected} error={uploadError} />
        </section>
      )}

      {step === "preview" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Preview — {rows.length} rows found
              </h2>
              <p className="text-sm text-ink/50">
                Raw data as uploaded. Nothing has been sent to the AI yet.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
              >
                Choose different file
              </button>
              <button
                onClick={handleConfirm}
                disabled={isImporting}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {isImporting ? "Importing…" : "Confirm Import"}
              </button>
            </div>
          </div>

          {isImporting && (
            <p className="mb-3 text-sm font-medium text-accent">
              Sending rows to the AI in batches — this can take a moment for large files…
            </p>
          )}
          {importError && (
            <p className="mb-3 text-sm font-medium text-red-600">{importError}</p>
          )}

          <PreviewTable headers={headers} rows={rows} />
        </section>
      )}

      {step === "result" && result && (
        <section>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Total rows" value={result.total_rows} />
            <StatCard label="Imported" value={result.total_imported} tone="accent" />
            <StatCard label="Skipped" value={result.total_skipped} tone="warn" />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Import Result</h2>
            <button
              onClick={reset}
              className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
            >
              Import another file
            </button>
          </div>

          <ResultTable imported={result.imported} skipped={result.skipped} />
        </section>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "accent" | "warn";
}) {
  const valueClass =
    tone === "accent" ? "text-accent" : tone === "warn" ? "text-amber-600" : "text-ink";
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</p>
      <p className={`font-display text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
