// Shared shapes used across components - kept in one file so the
// frontend and the "what does the backend return" mental model stay in sync.

export type CrmRecord = {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
};

export type SkippedRow = {
  original_row: Record<string, string>;
  reason: string;
};

export type ImportResponse = {
  total_rows: number;
  total_imported: number;
  total_skipped: number;
  imported: CrmRecord[];
  skipped: SkippedRow[];
};

// Raw CSV row as parsed client-side, before any AI processing.
export type RawCsvRow = Record<string, string>;

export type Step = "upload" | "preview" | "result";
