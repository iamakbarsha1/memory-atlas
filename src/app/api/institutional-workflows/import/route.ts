import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import {
  createInstitutionalWorkflowRepository,
  importCsvForRequest,
} from "@/features/institutional-workflows/server";

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
    repository: createInstitutionalWorkflowRepository(client),
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const result = await importCsvForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
      body,
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}
