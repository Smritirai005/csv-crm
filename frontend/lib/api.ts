import { ImportResponse } from "./types";

// Backend URL comes from an env var so the same build works locally and
// once deployed (Vercel frontend -> Railway/Render backend, for example).
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Sends the ORIGINAL uploaded File to the backend for AI extraction.
 * Only called once, when the user clicks "Confirm Import".
 */
export async function importCsv(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Import failed (${res.status})`);
  }

  return res.json();
}
