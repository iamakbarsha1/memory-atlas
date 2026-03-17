import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { createMemoryRepository } from "@/features/memories/service";
import { deleteMemoryForRequest, updateMemoryForRequest } from "@/features/memories/server";

function buildDeps() {
  const client = isSupabaseServerConfigured ? createSupabaseServerClient() : null;

  return {
    isConfigured: isSupabaseServerConfigured,
    getUserIdForToken: async (token: string) => {
      if (!client) {
        return { userId: null, error: "Supabase server configuration is missing." };
      }

      const { data, error } = await client.auth.getUser(token);

      return {
        userId: data.user?.id ?? null,
        error: error?.message ?? null,
      };
    },
    ensureUserProfile: async () => ({ error: null }),
    repository: client ? createMemoryRepository(client) : createMemoryRepository(null),
  };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ memoryId: string }> },
) {
  const body = (await request.json()) as Record<string, unknown>;
  const { memoryId } = await context.params;
  const result = await updateMemoryForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
      memoryId,
      body,
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ memoryId: string }> },
) {
  const { memoryId } = await context.params;
  const result = await deleteMemoryForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
      memoryId,
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}
