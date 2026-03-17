import { createMemoryRecord, createMemoryRepository, type MemoryRepository } from "@/features/memories/service";
import type { CreateMemoryInput, DatabaseMemoryRecord, MemoryRecord } from "@/features/memories/types";
import { parseInstitutionalCsv } from "./csv";
import type {
  AssignReviewerInput,
  ImportCsvInput,
  ImportCsvResult,
  ModerateMemoryInput,
  ModerationAction,
  ModerationAuditEntry,
} from "./types";

type QueryResult = { data: unknown; error: { message?: string } | null };

type SelectQueryBuilder = PromiseLike<QueryResult> & {
  eq: (column: string, value: string) => SelectQueryBuilder;
  order: (
    column: string,
    options: { ascending: boolean; nullsFirst?: boolean },
  ) => SelectQueryBuilder;
  single: () => Promise<QueryResult>;
};

type SupabaseTableClient =
  | {
      from: (table: string) => unknown;
    }
  | null;

type ModerationAuditDbRecord = {
  id: string;
  memory_id: string;
  action: string;
  actor_name: string | null;
  reviewer_assigned_to: string | null;
  institution_name: string | null;
  note: string | null;
  created_at: string;
};

export type InstitutionalWorkflowRepository = {
  getMemoryById: (memoryId: string, userId: string) => Promise<{ data: DatabaseMemoryRecord | null; error: string | null }>;
  updateMemoryWorkflow: (
    memoryId: string,
    userId: string,
    input: Record<string, unknown>,
  ) => Promise<{ data: DatabaseMemoryRecord | null; error: string | null }>;
  createAuditLog: (
    input: Record<string, unknown>,
  ) => Promise<{ data: ModerationAuditEntry | null; error: string | null }>;
  createMemoryRepository: () => MemoryRepository;
};

export type InstitutionalWorkflowDeps = {
  isConfigured: boolean;
  getUserIdForToken: (token: string) => Promise<{ userId: string | null; error: string | null }>;
  repository: InstitutionalWorkflowRepository;
};

type WorkflowResponse = {
  status: number;
  body: Record<string, unknown>;
};

export function createInstitutionalWorkflowRepository(
  client: SupabaseTableClient,
): InstitutionalWorkflowRepository {
  return {
    async getMemoryById(memoryId, userId) {
      if (!client) {
        return { data: null, error: "Supabase server configuration is missing." };
      }

      const table = client.from("memories") as {
        select: (query: string) => SelectQueryBuilder;
      };

      const { data, error } = await table.select("*").eq("id", memoryId).eq("user_id", userId).single();

      return {
        data: (data as DatabaseMemoryRecord | null) ?? null,
        error: error?.message ?? null,
      };
    },

    async updateMemoryWorkflow(memoryId, userId, input) {
      if (!client) {
        return { data: null, error: "Supabase server configuration is missing." };
      }

      const table = client.from("memories") as {
        update: (value: Record<string, unknown>) => {
          eq: (column: string, value: string) => {
            eq: (column: string, value: string) => {
              select: () => { single: () => Promise<QueryResult> };
            };
          };
        };
      };

      const { data, error } = await table
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", memoryId)
        .eq("user_id", userId)
        .select()
        .single();

      return {
        data: (data as DatabaseMemoryRecord | null) ?? null,
        error: error?.message ?? null,
      };
    },

    async createAuditLog(input) {
      if (!client) {
        return { data: null, error: "Supabase server configuration is missing." };
      }

      const table = client.from("moderation_audit_logs") as {
        insert: (value: Record<string, unknown>) => {
          select: () => { single: () => Promise<QueryResult> };
        };
      };

      const { data, error } = await table.insert(input).select().single();

      return {
        data: data ? mapAuditRecord(data as ModerationAuditDbRecord) : null,
        error: error?.message ?? null,
      };
    },

    createMemoryRepository() {
      return createMemoryRepository(client);
    },
  };
}

export async function assignReviewerForRequest(
  request: { authorizationHeader?: string | null; body: Partial<AssignReviewerInput> | null },
  deps: InstitutionalWorkflowDeps,
): Promise<WorkflowResponse> {
  const auth = await authenticate(request.authorizationHeader, deps);
  if (auth.error) {
    return { status: auth.status, body: { data: null, error: auth.error } };
  }

  const body = request.body ?? {};
  const reviewerAssignedTo = body.reviewerAssignedTo?.trim() ?? "";
  if (!body.memoryId || !reviewerAssignedTo) {
    return {
      status: 400,
      body: { data: null, error: "Memory id and reviewer name are required." },
    };
  }

  const memory = await deps.repository.getMemoryById(body.memoryId, auth.userId);
  if (memory.error || !memory.data) {
    return {
      status: memory.error ? 500 : 404,
      body: { data: null, error: memory.error ?? "Memory record not found." },
    };
  }

  const updated = await deps.repository.updateMemoryWorkflow(body.memoryId, auth.userId, {
    reviewer_assigned_to: reviewerAssignedTo,
    reviewer_assigned_at: new Date().toISOString(),
    institution_name: body.institutionName?.trim() || memory.data.institution_name || null,
    moderation_decision_note: body.note?.trim() || memory.data.moderation_decision_note || null,
  });

  if (updated.error || !updated.data) {
    return {
      status: 500,
      body: { data: null, error: updated.error ?? "Unable to assign reviewer." },
    };
  }

  const audit = await deps.repository.createAuditLog({
    user_id: auth.userId,
    memory_id: body.memoryId,
    action: "ASSIGN_REVIEWER",
    actor_name: body.actorName?.trim() || reviewerAssignedTo,
    reviewer_assigned_to: reviewerAssignedTo,
    institution_name: body.institutionName?.trim() || updated.data.institution_name || null,
    note: body.note?.trim() || null,
  });

  return {
    status: audit.error ? 500 : 200,
    body: {
      data: {
        memoryId: body.memoryId,
        auditEntry: audit.data,
      },
      error: audit.error,
    },
  };
}

export async function moderateMemoryForRequest(
  request: { authorizationHeader?: string | null; body: Partial<ModerateMemoryInput> | null },
  deps: InstitutionalWorkflowDeps,
): Promise<WorkflowResponse> {
  const auth = await authenticate(request.authorizationHeader, deps);
  if (auth.error) {
    return { status: auth.status, body: { data: null, error: auth.error } };
  }

  const body = request.body ?? {};
  const action = coerceModerationAction(body.action);
  const actorName = body.actorName?.trim() ?? "";
  const note = body.note?.trim() ?? "";

  if (!body.memoryId || !action || !actorName || !note) {
    return {
      status: 400,
      body: { data: null, error: "Memory, moderation action, actor, and decision note are required." },
    };
  }

  const memory = await deps.repository.getMemoryById(body.memoryId, auth.userId);
  if (memory.error || !memory.data) {
    return {
      status: memory.error ? 500 : 404,
      body: { data: null, error: memory.error ?? "Memory record not found." },
    };
  }

  const status = mapActionToStatus(action);
  const updated = await deps.repository.updateMemoryWorkflow(body.memoryId, auth.userId, {
    status,
    reviewed_by: actorName,
    reviewed_at: new Date().toISOString(),
    review_notes: note,
    moderation_decision_note: note,
    institution_name: body.institutionName?.trim() || memory.data.institution_name || null,
  });

  if (updated.error || !updated.data) {
    return {
      status: 500,
      body: { data: null, error: updated.error ?? "Unable to update moderation state." },
    };
  }

  const audit = await deps.repository.createAuditLog({
    user_id: auth.userId,
    memory_id: body.memoryId,
    action,
    actor_name: actorName,
    reviewer_assigned_to: updated.data.reviewer_assigned_to ?? null,
    institution_name: body.institutionName?.trim() || updated.data.institution_name || null,
    note,
  });

  return {
    status: audit.error ? 500 : 200,
    body: {
      data: {
        memoryId: body.memoryId,
        auditEntry: audit.data,
      },
      error: audit.error,
    },
  };
}

export async function importCsvForRequest(
  request: { authorizationHeader?: string | null; body: Partial<ImportCsvInput> | null },
  deps: InstitutionalWorkflowDeps,
): Promise<WorkflowResponse> {
  const auth = await authenticate(request.authorizationHeader, deps);
  if (auth.error) {
    return { status: auth.status, body: { data: null, error: auth.error } };
  }

  const body = request.body ?? {};
  const actorName = body.actorName?.trim() ?? "";
  const institutionName = body.institutionName?.trim() ?? "";

  if (!actorName || !institutionName) {
    return {
      status: 400,
      body: { data: null, error: "Actor name and institution name are required." },
    };
  }

  const parsed = parseInstitutionalCsv(body.csvText ?? "");
  if (parsed.error) {
    return {
      status: 400,
      body: { data: null, error: parsed.error },
    };
  }

  const batchId = `batch-${Date.now()}`;
  const memoryRepository = deps.repository.createMemoryRepository();
  const importedMemories: MemoryRecord[] = [];
  const auditEntries: ModerationAuditEntry[] = [];

  for (const row of parsed.rows) {
    const created = await createMemoryRecord(
      {
        ...row,
        description: row.description || undefined,
        placeName: row.placeName || row.sourceName || "Imported place",
        dateOccurred: row.dateOccurred || undefined,
        personName: row.personName || undefined,
        sourceUrl: row.sourceUrl || undefined,
        sourceNotes: row.sourceNotes || undefined,
        reviewNotes: row.reviewNotes || `Imported by ${actorName} for institutional review.`,
        respectfulHandlingNotes: row.respectfulHandlingNotes || undefined,
        reviewedBy: "",
        reviewedAt: "",
        institutionName,
        reviewerAssignedTo: body.reviewerAssignedTo?.trim() || row.reviewerAssignedTo || actorName,
        reviewerAssignedAt: new Date().toISOString(),
        moderationDecisionNote: "",
        importBatchId: batchId,
        status: "REVIEW",
        userId: auth.userId,
      } satisfies CreateMemoryInput,
      memoryRepository,
    );

    if (created.error || !created.data) {
      return {
        status: 400,
        body: { data: null, error: created.error ?? "Unable to import one of the CSV rows." },
      };
    }

    importedMemories.push(created.data);
    const audit = await deps.repository.createAuditLog({
      user_id: auth.userId,
      memory_id: created.data.id,
      action: "IMPORT_CSV",
      actor_name: actorName,
      reviewer_assigned_to: body.reviewerAssignedTo?.trim() || row.reviewerAssignedTo || actorName,
      institution_name: institutionName,
      note: `Imported from CSV batch ${batchId}.`,
    });

    if (audit.error || !audit.data) {
      return {
        status: 500,
        body: { data: null, error: audit.error ?? "Unable to record import audit entry." },
      };
    }

    auditEntries.push(audit.data);
  }

  return {
    status: 201,
    body: {
      data: {
        importedCount: importedMemories.length,
        batchId,
        memories: importedMemories,
        auditEntries,
      } satisfies ImportCsvResult,
      error: null,
    },
  };
}

async function authenticate(
  authorizationHeader: string | null | undefined,
  deps: InstitutionalWorkflowDeps,
) {
  if (!deps.isConfigured) {
    return {
      status: 503,
      userId: "",
      error: "Supabase server configuration is missing.",
    };
  }

  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return {
      status: 401,
      userId: "",
      error: "Authorization token is required.",
    };
  }

  const result = await deps.getUserIdForToken(token);

  if (!result.userId || result.error) {
    return {
      status: 401,
      userId: "",
      error: result.error ?? "Unable to verify the user session.",
    };
  }

  return {
    status: 200,
    userId: result.userId,
    error: null,
  };
}

function coerceModerationAction(action: unknown): ModerationAction | undefined {
  if (action === "SEND_TO_REVIEW" || action === "PUBLISH" || action === "ARCHIVE") {
    return action;
  }

  return undefined;
}

function mapActionToStatus(action: ModerationAction) {
  if (action === "SEND_TO_REVIEW") {
    return "REVIEW";
  }

  if (action === "PUBLISH") {
    return "PUBLISHED";
  }

  return "ARCHIVED";
}

function mapAuditRecord(record: ModerationAuditDbRecord): ModerationAuditEntry {
  return {
    id: record.id,
    memoryId: record.memory_id,
    action: record.action,
    actorName: record.actor_name,
    reviewerAssignedTo: record.reviewer_assigned_to,
    institutionName: record.institution_name,
    note: record.note,
    createdAt: record.created_at,
  };
}
