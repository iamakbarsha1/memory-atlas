import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { createRelationshipForRequest } from "@/features/family-atlas/server";

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
      listPeopleByUser: async (userId: string) => {
        if (!client) {
          return { data: [], error: "Supabase server configuration is missing." };
        }

        const { data, error } = await client.from("people").select("*").eq("user_id", userId);

        return {
          data:
            data?.map((person) => ({
              id: person.id,
              firstName: person.first_name,
              lastName: person.last_name,
              fullName: `${person.first_name} ${person.last_name}`.trim(),
              birthDate: person.birth_date,
              deathDate: person.death_date,
              bio: person.bio,
              userId: person.user_id,
              createdAt: person.created_at,
            })) ?? [],
          error: error?.message ?? null,
        };
      },
      listRelationships: async () => {
        if (!client) {
          return { data: [], error: "Supabase server configuration is missing." };
        }

        const { data, error } = await client.from("relationships").select("*");

        return {
          data:
            data?.map((relationship) => ({
              id: relationship.id,
              personId: relationship.person_id,
              relatedPersonId: relationship.related_person_id,
              type: relationship.type,
              createdAt: relationship.created_at,
            })) ?? [],
          error: error?.message ?? null,
        };
      },
      createPerson: async () => ({ data: null, error: "Not implemented on this route." }),
      createRelationship: async (input: { personId: string; relatedPersonId: string; type: string }) => {
        if (!client) {
          return { data: null, error: "Supabase server configuration is missing." };
        }

        const { data, error } = await client
          .from("relationships")
          .insert({
            person_id: input.personId,
            related_person_id: input.relatedPersonId,
            type: input.type,
          })
          .select()
          .single();

        return {
          data: data
            ? {
                id: data.id,
                personId: data.person_id,
                relatedPersonId: data.related_person_id,
                type: data.type,
                createdAt: data.created_at,
              }
            : null,
          error: error?.message ?? null,
        };
      },
    },
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const result = await createRelationshipForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
      body,
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}
