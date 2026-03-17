import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, isSupabaseServerConfigured } from "@/lib/supabaseServer";
import { getFamilyAtlasForRequest } from "@/features/family-atlas/server";

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

        const { data, error } = await client
          .from("people")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

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

        const { data, error } = await client
          .from("relationships")
          .select("*")
          .order("created_at", { ascending: true });

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
      createRelationship: async () => ({ data: null, error: "Not implemented on this route." }),
    },
  };
}

export async function GET(request: NextRequest) {
  const result = await getFamilyAtlasForRequest(
    {
      authorizationHeader: request.headers.get("authorization"),
    },
    buildDeps(),
  );

  return NextResponse.json(result.body, { status: result.status });
}
