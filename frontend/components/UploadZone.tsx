"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onFileSelected: (file: File) => void;
  error?: string | null;
};

export default function UploadZone({ onFileSelected, error }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        onFileSelected(file); // let parent decide how to surface the error
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          "cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-colors",
          isDragging ? "border-accent bg-accent/5" : "border-ink/15 bg-white",
        ].join(" ")}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink/5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-display text-lg font-medium text-ink">
          Drop your CSV here, or click to browse
        </p>
        <p className="mt-1 text-sm text-ink/50">
          Any layout — Facebook, Google Ads, spreadsheets, CRM exports, etc.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
