import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { createFamilyPersonForRequest } from "@/features/family-atlas/server";

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
    repository: {
      listPeopleByUser: async () => ({ data: [], error: "Not implemented on this route." }),
      listRelationships: async () => ({ data: [], error: "Not implemented on this route." }),
      createPerson: async (userId: string, input: { firstName: string; lastName: string; birthDate?: string; deathDate?: string; bio?: string }) => {
        if (!client) {
          return { data: null, error: "Supabase server configuration is missing." };
        }

        const { data, error } = await client
          .from("people")
          .insert({
            first_name: input.firstName,
            last_name: input.lastName,
            birth_date: input.birthDate || null,
            death_date: input.deathDate || null,
            bio: input.bio || null,
            user_id: userId,
          })
          .select()
          .single();

        return {
          data: data
            ? {
                id: data.id,
                firstName: data.first_name,
                lastName: data.last_name,
                fullName: `${data.first_name} ${data.last_name}`.trim(),
                birthDate: data.birth_date,
                deathDate: data.death_date,
                bio: data.bio,
                userId: data.user_id,
                createdAt: data.created_at,
              }
            : null,
          error: error?.message ?? null,
        };
      },
      createRelationship: async () => ({ data: null, error: "Not implemented on this route." }),
    },
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const result = await createFamilyPersonForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
      body,
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}
