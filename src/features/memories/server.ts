import {
  createMemoryRecord,
  deleteMemoryRecord,
  listMemoryRecords,
  updateMemoryRecord,
  type MemoryRepository,
} from "./service";
import type { CreateMemoryInput, MemoryLayer, MemoryStatus, UpdateMemoryInput } from "./types";

export type MemoryRequestDeps = {
  isConfigured: boolean;
  getUserIdForToken: (
    token: string,
  ) => Promise<{ userId: string | null; error: string | null }>;
  ensureUserProfile?: (token: string, userId: string) => Promise<{ error: string | null }>;
  repository: MemoryRepository;
};

type RequestResponse = {
  status: number;
  body: Record<string, unknown>;
};

export async function listMemoriesForRequest(
  request: {
    authorizationHeader?: string | null;
    layer?: string | null;
    query?: string | null;
    status?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
  },
  deps: MemoryRequestDeps,
): Promise<RequestResponse> {
  if (!deps.isConfigured) {
    return {
      status: 503,
      body: { data: [], error: "Supabase server configuration is missing." },
    };
  }

  const auth = await authenticateRequest(request.authorizationHeader, deps);
  if (auth.error) {
    return {
      status: auth.status,
      body: { data: [], error: auth.error },
    };
  }

  const layer = coerceLayer(request.layer);
  const status = coerceStatus(request.status);
  const result = await listMemoryRecords(
    auth.userId,
    {
      layer,
      status,
      query: request.query ?? undefined,
      dateFrom: request.dateFrom ?? undefined,
      dateTo: request.dateTo ?? undefined,
    },
    deps.repository,
  );

  return {
    status: result.error ? 500 : 200,
    body: {
      data: result.data,
      error: result.error,
    },
  };
}

export async function createMemoryForRequest(
  request: {
    authorizationHeader?: string | null;
    body: Partial<CreateMemoryInput> | null;
  },
  deps: MemoryRequestDeps,
): Promise<RequestResponse> {
  if (!deps.isConfigured) {
    return {
      status: 503,
      body: { data: null, error: "Supabase server configuration is missing." },
    };
  }

  const auth = await authenticateRequest(request.authorizationHeader, deps);
  if (auth.error) {
    return {
      status: auth.status,
      body: { data: null, error: auth.error },
    };
  }

  const body = request.body ?? {};

  if (deps.ensureUserProfile) {
    const profileResult = await deps.ensureUserProfile(auth.token, auth.userId);
    if (profileResult.error) {
      return {
        status: 500,
        body: { data: null, error: profileResult.error },
      };
    }
  }

  const result = await createMemoryRecord(
    {
      title: body.title ?? "",
      description: body.description,
      layer: (body.layer as CreateMemoryInput["layer"]) ?? "BURIAL",
      type: (body.type as CreateMemoryInput["type"]) ?? "BURIAL",
      latitude: Number(body.latitude ?? Number.NaN),
      longitude: Number(body.longitude ?? Number.NaN),
      dateOccurred: body.dateOccurred,
      personName: body.personName,
      visibility: (body.visibility as CreateMemoryInput["visibility"]) ?? "PRIVATE",
      status: (body.status as CreateMemoryInput["status"]) ?? "DRAFT",
      sourceType: (body.sourceType as CreateMemoryInput["sourceType"]) ?? "FAMILY",
      sourceName: body.sourceName ?? "",
      sourceUrl: body.sourceUrl,
      sourceNotes: body.sourceNotes,
      userId: auth.userId,
    },
    deps.repository,
  );

  if (result.validationErrors && Object.keys(result.validationErrors).length > 0) {
    return {
      status: 400,
      body: {
        data: null,
        error: result.error,
        validationErrors: result.validationErrors,
      },
    };
  }

  return {
    status: result.error ? 500 : 201,
    body: {
      data: result.data,
      error: result.error,
      validationErrors: result.validationErrors,
    },
  };
}

export async function updateMemoryForRequest(
  request: {
    authorizationHeader?: string | null;
    memoryId: string;
    body: Partial<UpdateMemoryInput> | null;
  },
  deps: MemoryRequestDeps,
): Promise<RequestResponse> {
  if (!deps.isConfigured) {
    return {
      status: 503,
      body: { data: null, error: "Supabase server configuration is missing." },
    };
  }

  const auth = await authenticateRequest(request.authorizationHeader, deps);
  if (auth.error) {
    return {
      status: auth.status,
      body: { data: null, error: auth.error },
    };
  }

  const body = request.body ?? {};
  const result = await updateMemoryRecord(
    {
      id: request.memoryId,
      title: body.title ?? "",
      description: body.description,
      layer: (body.layer as UpdateMemoryInput["layer"]) ?? "BURIAL",
      type: (body.type as UpdateMemoryInput["type"]) ?? "BURIAL",
      latitude: Number(body.latitude ?? Number.NaN),
      longitude: Number(body.longitude ?? Number.NaN),
      dateOccurred: body.dateOccurred,
      personName: body.personName,
      visibility: (body.visibility as UpdateMemoryInput["visibility"]) ?? "PRIVATE",
      status: (body.status as UpdateMemoryInput["status"]) ?? "DRAFT",
      sourceType: (body.sourceType as UpdateMemoryInput["sourceType"]) ?? "FAMILY",
      sourceName: body.sourceName ?? "",
      sourceUrl: body.sourceUrl,
      sourceNotes: body.sourceNotes,
      userId: auth.userId,
    },
    deps.repository,
  );

  if (result.validationErrors && Object.keys(result.validationErrors).length > 0) {
    return {
      status: 400,
      body: {
        data: null,
        error: result.error,
        validationErrors: result.validationErrors,
      },
    };
  }

  return {
    status: result.error ? 500 : 200,
    body: {
      data: result.data,
      error: result.error,
      validationErrors: result.validationErrors,
    },
  };
}

export async function deleteMemoryForRequest(
  request: {
    authorizationHeader?: string | null;
    memoryId: string;
  },
  deps: MemoryRequestDeps,
): Promise<RequestResponse> {
  if (!deps.isConfigured) {
    return {
      status: 503,
      body: { error: "Supabase server configuration is missing." },
    };
  }

  const auth = await authenticateRequest(request.authorizationHeader, deps);
  if (auth.error) {
    return {
      status: auth.status,
      body: { error: auth.error },
    };
  }

  const result = await deleteMemoryRecord(request.memoryId, auth.userId, deps.repository);

  return {
    status: result.error ? 500 : 200,
    body: {
      error: result.error,
    },
  };
}

async function authenticateRequest(
  authorizationHeader: string | null | undefined,
  deps: MemoryRequestDeps,
) {
  const token = extractBearerToken(authorizationHeader);

  if (!token) {
    return {
      status: 401,
      userId: "",
      token: "",
      error: "Authorization token is required.",
    };
  }

  const result = await deps.getUserIdForToken(token);

  if (result.error || !result.userId) {
    return {
      status: 401,
      userId: "",
      token: "",
      error: result.error ?? "Unable to verify the user session.",
    };
  }

  return {
    status: 200,
    userId: result.userId,
    token,
    error: null,
  };
}

function extractBearerToken(authorizationHeader: string | null | undefined) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim() || null;
}

function coerceLayer(layer: string | null | undefined): MemoryLayer | undefined {
  if (layer === "BURIAL" || layer === "HOME" || layer === "EDUCATION" || layer === "HISTORY") {
    return layer;
  }

  return undefined;
}

function coerceStatus(status: string | null | undefined): MemoryStatus | undefined {
  if (status === "DRAFT" || status === "REVIEW" || status === "PUBLISHED" || status === "ARCHIVED") {
    return status;
  }

  return undefined;
}
