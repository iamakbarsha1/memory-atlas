import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { createMemoryRepository } from "@/features/memories/service";
import { createMemoryForRequest, listMemoriesForRequest } from "@/features/memories/server";

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
    ensureUserProfile: async (token: string, userId: string) => {
      if (!client) {
        return { error: "Supabase server configuration is missing." };
      }

      const { data, error: userError } = await client.auth.getUser(token);
      const email = data.user?.id === userId ? data.user.email ?? null : null;
      const fullName =
        data.user?.id === userId
          ? ((data.user.user_metadata?.full_name as string | undefined) ?? null)
          : null;

      const { error } = await client.from("users").upsert(
        {
          id: userId,
          email: email ?? `${userId}@memory-atlas.local`,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      return {
        error: error?.message ?? userError?.message ?? null,
      };
    },
    repository: client ? createMemoryRepository(client) : createMemoryRepository(null),
  };
}

export async function GET(request: NextRequest) {
  const result = await listMemoriesForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
      layer: request.nextUrl.searchParams.get("layer"),
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const result = await createMemoryForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
      body,
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}
