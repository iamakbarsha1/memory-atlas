import { supabase } from "@/lib/supabase";
import type {
  CreateMemoryInput,
  DatabaseMemoryRecord,
  MemoryLayer,
  MemoryRecord,
} from "./types";

type ValidationErrors = Partial<Record<keyof CreateMemoryInput | "sourceUrl", string>>;

type ValidationResult = {
  value: (CreateMemoryInput & { metadata: { personName?: string } | null }) | null;
  errors: ValidationErrors;
};

type RepositoryResult<T> = Promise<{ data: T | null; error: string | null }>;

export type MemoryRepository = {
  create: (input: Record<string, unknown>) => RepositoryResult<DatabaseMemoryRecord>;
  listByUser: (
    userId: string,
    options?: { layer?: MemoryLayer },
  ) => RepositoryResult<DatabaseMemoryRecord[]>;
};

export function validateMemoryInput(input: CreateMemoryInput): ValidationResult {
  const errors: ValidationErrors = {};
  const title = input.title.trim();
  const description = input.description?.trim() || "";
  const sourceName = input.sourceName.trim();
  const sourceUrl = input.sourceUrl?.trim() || "";
  const sourceNotes = input.sourceNotes?.trim() || "";
  const personName = input.personName?.trim() || "";

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

      const { data, error } = await query;

      return {
        data: (data as DatabaseMemoryRecord[] | null) ?? null,
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
  options?: { layer?: MemoryLayer },
  repository: MemoryRepository = createSupabaseMemoryRepository(),
) {
  const result = await repository.listByUser(userId, options);

  return {
    data: result.data?.map(mapDatabaseRecord) ?? [],
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
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}
