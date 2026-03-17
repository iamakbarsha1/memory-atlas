import { supabase } from "@/lib/supabase";
import type {
  CreateMemoryInput,
  DatabaseMemoryRecord,
  MemoryListFilters,
  MemoryRecord,
  UpdateMemoryInput,
} from "./types";

type ValidationErrors = Partial<Record<keyof CreateMemoryInput | keyof UpdateMemoryInput | "sourceUrl", string>>;

type ValidationResult = {
  value: (CreateMemoryInput & { metadata: { personName?: string } | null }) | null;
  errors: ValidationErrors;
};

type RepositoryResult<T> = Promise<{ data: T | null; error: string | null }>;

export type MemoryRepository = {
  create: (input: Record<string, unknown>) => RepositoryResult<DatabaseMemoryRecord>;
  listByUser: (
    userId: string,
    options?: MemoryListFilters,
  ) => RepositoryResult<DatabaseMemoryRecord[]>;
  update: (
    memoryId: string,
    userId: string,
    input: Record<string, unknown>,
  ) => RepositoryResult<DatabaseMemoryRecord>;
  remove: (memoryId: string, userId: string) => Promise<{ error: string | null }>;
};

export function validateMemoryInput(input: CreateMemoryInput): ValidationResult {
  const errors: ValidationErrors = {};
  const title = input.title.trim();
  const description = input.description?.trim() || "";
  const sourceName = input.sourceName.trim();
  const sourceUrl = input.sourceUrl?.trim() || "";
  const sourceNotes = input.sourceNotes?.trim() || "";
  const personName = input.personName?.trim() || "";
  const reviewNotes = input.reviewNotes?.trim() || "";
  const respectfulHandlingNotes = input.respectfulHandlingNotes?.trim() || "";
  const reviewedBy = input.reviewedBy?.trim() || "";
  const reviewedAt = input.reviewedAt?.trim() || "";
  const isSensitiveRecord = input.sensitivity !== "STANDARD" || input.type === "BURIAL";

  if (!title) {
    errors.title = "Title is required.";
  }

  if (!sourceName) {
    errors.sourceName = "Source name is required.";
  }

  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  if (sourceUrl) {
    try {
      new URL(sourceUrl);
    } catch {
      errors.sourceUrl = "Source URL must be a valid URL.";
    }
  }

  if (input.status === "PUBLISHED" && input.trustLabel === "UNVERIFIED") {
    errors.trustLabel = "Published records need a confirmed trust label.";
  }

  if (input.status !== "DRAFT" && !reviewNotes) {
    errors.reviewNotes = "Review notes are required when sending a record beyond draft.";
  }

  if (isSensitiveRecord && !respectfulHandlingNotes) {
    errors.respectfulHandlingNotes =
      "Sensitive and memorial records require respectful handling guidance.";
  }

  if (
    (input.type === "BURIAL" || input.sensitivity === "MEMORIAL") &&
    input.visibility === "PUBLIC" &&
    !input.hidePreciseLocation
  ) {
    errors.hidePreciseLocation =
      "Public memorial and burial records must hide precise coordinates.";
  }

  if (reviewedAt && Number.isNaN(Date.parse(reviewedAt))) {
    errors.reviewedAt = "Reviewed at must be a valid date.";
  }

  if (Object.keys(errors).length > 0) {
    return { value: null, errors };
  }

  return {
    value: {
      ...input,
      title,
      description,
      sourceName,
      sourceUrl,
      sourceNotes,
      personName,
      reviewNotes,
      respectfulHandlingNotes,
      reviewedBy,
      reviewedAt,
      metadata: personName ? { personName } : null,
    },
    errors,
  };
}

type QueryResult = { data: unknown; error: { message?: string } | null };

type InsertQueryBuilder = {
  select: () => {
    single: () => Promise<QueryResult>;
  };
};

type SelectQueryBuilder = PromiseLike<QueryResult> & {
  eq: (column: string, value: string) => SelectQueryBuilder;
  order: (
    column: string,
    options: { ascending: boolean; nullsFirst?: boolean },
  ) => SelectQueryBuilder;
};

type SupabaseTableClient =
  | {
      from: (table: string) => unknown;
    }
  | null;

export function createMemoryRepository(client: SupabaseTableClient): MemoryRepository {
  return {
    async create(input) {
      if (!client) {
        return { data: null, error: "Supabase server configuration is missing." };
      }

      const table = client.from("memories") as {
        insert: (value: Record<string, unknown>) => InsertQueryBuilder;
      };

      const { data, error } = await table
        .insert(input)
        .select()
        .single();

      return {
        data: (data as DatabaseMemoryRecord | null) ?? null,
        error: error?.message ?? null,
      };
    },
    async listByUser(userId, options) {
      if (!client) {
        return { data: null, error: "Supabase server configuration is missing." };
      }

      const table = client.from("memories") as {
        select: (query: string) => SelectQueryBuilder;
      };

      let query = table
        .select("*")
        .eq("user_id", userId)
        .order("date_occurred", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (options?.layer) {
        query = query.eq("layer", options.layer);
      }

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.sensitivity) {
        query = query.eq("sensitivity", options.sensitivity);
      }

      const { data, error } = await query;

      return {
        data: (data as DatabaseMemoryRecord[] | null) ?? null,
        error: error?.message ?? null,
      };
    },
    async update(memoryId, userId, input) {
      if (!client) {
        return { data: null, error: "Supabase server configuration is missing." };
      }

      const table = client.from("memories") as {
        update: (value: Record<string, unknown>) => {
          eq: (column: string, value: string) => {
            eq: (column: string, value: string) => {
              select: () => {
                single: () => Promise<QueryResult>;
              };
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
    async remove(memoryId, userId) {
      if (!client) {
        return { error: "Supabase server configuration is missing." };
      }

      const table = client.from("memories") as {
        delete: () => {
          eq: (column: string, value: string) => {
            eq: (column: string, value: string) => Promise<QueryResult>;
          };
        };
      };

      const { error } = await table
        .delete()
        .eq("id", memoryId)
        .eq("user_id", userId);

      return {
        error: error?.message ?? null,
      };
    },
  };
}

export function createSupabaseMemoryRepository(): MemoryRepository {
  return createMemoryRepository(supabase as unknown as SupabaseTableClient);
}

export async function createMemoryRecord(
  input: CreateMemoryInput,
  repository: MemoryRepository = createSupabaseMemoryRepository(),
) {
  const validation = validateMemoryInput(input);

  if (!validation.value) {
    return {
      data: null,
      error: "Please correct the highlighted fields.",
      validationErrors: validation.errors,
    };
  }

  const { metadata, ...value } = validation.value;
  const payload = {
    title: value.title,
    description: value.description || null,
    layer: value.layer,
    type: value.type,
    latitude: value.latitude.toString(),
    longitude: value.longitude.toString(),
    user_id: value.userId,
    person_id: null,
    metadata,
    media_urls: [],
    date_occurred: value.dateOccurred ? new Date(value.dateOccurred).toISOString() : null,
    source_type: value.sourceType,
    source_name: value.sourceName,
    source_url: value.sourceUrl || null,
    source_notes: value.sourceNotes || null,
    trust_label: value.trustLabel,
    sensitivity: value.sensitivity,
    review_notes: value.reviewNotes || null,
    respectful_handling_notes: value.respectfulHandlingNotes || null,
    reviewed_by: value.reviewedBy || null,
    reviewed_at: value.reviewedAt ? new Date(value.reviewedAt).toISOString() : null,
    hide_precise_location: value.hidePreciseLocation,
    visibility: value.visibility,
    status: value.status,
  };

  const result = await repository.create(payload);

  return {
    data: result.data ? mapDatabaseRecord(result.data) : null,
    error: result.error,
    validationErrors: {},
  };
}

export async function listMemoryRecords(
  userId: string,
  options?: MemoryListFilters,
  repository: MemoryRepository = createSupabaseMemoryRepository(),
) {
  const result = await repository.listByUser(userId, options);
  const records = result.data?.map(mapDatabaseRecord) ?? [];

  return {
    data: applyMemoryFilters(records, options),
    error: result.error,
  };
}

export async function updateMemoryRecord(
  input: UpdateMemoryInput,
  repository: MemoryRepository = createSupabaseMemoryRepository(),
) {
  const { id, ...rest } = input;
  const validation = validateMemoryInput(rest);

  if (!validation.value) {
    return {
      data: null,
      error: "Please correct the highlighted fields.",
      validationErrors: validation.errors,
    };
  }

  const { metadata, ...value } = validation.value;
  const payload = {
    title: value.title,
    description: value.description || null,
    layer: value.layer,
    type: value.type,
    latitude: value.latitude.toString(),
    longitude: value.longitude.toString(),
    person_id: null,
    metadata,
    media_urls: [],
    date_occurred: value.dateOccurred ? new Date(value.dateOccurred).toISOString() : null,
    source_type: value.sourceType,
    source_name: value.sourceName,
    source_url: value.sourceUrl || null,
    source_notes: value.sourceNotes || null,
    trust_label: value.trustLabel,
    sensitivity: value.sensitivity,
    review_notes: value.reviewNotes || null,
    respectful_handling_notes: value.respectfulHandlingNotes || null,
    reviewed_by: value.reviewedBy || null,
    reviewed_at: value.reviewedAt ? new Date(value.reviewedAt).toISOString() : null,
    hide_precise_location: value.hidePreciseLocation,
    visibility: value.visibility,
    status: value.status,
  };

  const result = await repository.update(id, value.userId, payload);

  return {
    data: result.data ? mapDatabaseRecord(result.data) : null,
    error: result.error,
    validationErrors: {},
  };
}

export async function deleteMemoryRecord(
  memoryId: string,
  userId: string,
  repository: MemoryRepository = createSupabaseMemoryRepository(),
) {
  const result = await repository.remove(memoryId, userId);

  return {
    error: result.error,
  };
}

function mapDatabaseRecord(record: DatabaseMemoryRecord): MemoryRecord {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    layer: record.layer,
    type: record.type,
    latitude: Number(record.latitude),
    longitude: Number(record.longitude),
    dateOccurred: record.date_occurred,
    personName: record.metadata?.personName ?? null,
    visibility: record.visibility,
    status: record.status,
    sourceType: record.source_type,
    sourceName: record.source_name,
    sourceUrl: record.source_url,
    sourceNotes: record.source_notes,
    trustLabel: record.trust_label,
    sensitivity: record.sensitivity,
    reviewNotes: record.review_notes,
    respectfulHandlingNotes: record.respectful_handling_notes,
    reviewedBy: record.reviewed_by,
    reviewedAt: record.reviewed_at,
    hidePreciseLocation: Boolean(record.hide_precise_location),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function applyMemoryFilters(records: MemoryRecord[], options?: MemoryListFilters) {
  if (!options) {
    return records;
  }

  const normalizedQuery = options.query?.trim().toLowerCase();
  const fromTime = options.dateFrom ? Date.parse(options.dateFrom) : null;
  const toTime = options.dateTo ? Date.parse(options.dateTo) : null;

  return records.filter((record) => {
    if (options.layer && record.layer !== options.layer) {
      return false;
    }

    if (options.status && record.status !== options.status) {
      return false;
    }

    if (options.sensitivity && record.sensitivity !== options.sensitivity) {
      return false;
    }

    if (normalizedQuery) {
      const haystack = [
        record.title,
        record.description,
        record.personName,
        record.sourceName,
        record.sourceNotes,
        record.reviewNotes,
        record.respectfulHandlingNotes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }

    if ((fromTime || toTime) && record.dateOccurred) {
      const recordTime = Date.parse(record.dateOccurred);

      if (fromTime && recordTime < fromTime) {
        return false;
      }

      if (toTime && recordTime > toTime) {
        return false;
      }
    }

    if ((fromTime || toTime) && !record.dateOccurred) {
      return false;
    }

    return true;
  });
}
