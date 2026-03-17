import { supabase } from "@/lib/supabase";
import type {
  AssignReviewerInput,
  ImportCsvInput,
  ImportCsvResult,
  ModerateMemoryInput,
  ModerationAuditEntry,
} from "./types";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function postJson<T>(path: string, body: Record<string, unknown>) {
  const token = await getAccessToken();

  if (!token) {
    return { data: null as T | null, error: "Please sign in before using institutional workflows." };
  }

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as { data: T | null; error: string | null };
  return {
    data: payload.data,
    error: payload.error,
  };
}

export const institutionalWorkflowClientApi = {
  assignReviewer(input: AssignReviewerInput) {
    return postJson<{ memoryId: string; auditEntry: ModerationAuditEntry | null }>(
      "/api/institutional-workflows/assign",
      input,
    );
  },

  reviewMemory(input: ModerateMemoryInput) {
    return postJson<{ memoryId: string; auditEntry: ModerationAuditEntry | null }>(
      "/api/institutional-workflows/review",
      input,
    );
  },

  importCsv(input: ImportCsvInput) {
    return postJson<ImportCsvResult>("/api/institutional-workflows/import", input);
  },
};
