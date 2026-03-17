import { supabase } from "@/lib/supabase";
import type {
  CreateFamilyPersonInput,
  CreateRelationshipInput,
  FamilyAtlasPayload,
  FamilyPerson,
  FamilyRelationship,
} from "./types";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const familyAtlasClientApi = {
  async loadAtlas() {
    const token = await getAccessToken();

    if (!token) {
      return {
        data: { people: [], relationships: [] } satisfies FamilyAtlasPayload,
        error: "Please sign in to view the family atlas.",
      };
    }

    const response = await fetch("/api/family-atlas", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = (await response.json()) as {
      data: FamilyAtlasPayload;
      error: string | null;
    };

    return {
      data: payload.data,
      error: payload.error,
    };
  },

  async createPerson(input: CreateFamilyPersonInput) {
    const token = await getAccessToken();

    if (!token) {
      return { data: null as FamilyPerson | null, error: "Please sign in before adding a family member." };
    }

    const response = await fetch("/api/family-atlas/people", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as {
      data: FamilyPerson | null;
      error: string | null;
    };

    return payload;
  },

  async createRelationship(input: CreateRelationshipInput) {
    const token = await getAccessToken();

    if (!token) {
      return {
        data: null as FamilyRelationship | null,
        error: "Please sign in before creating a relationship.",
      };
    }

    const response = await fetch("/api/family-atlas/relationships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as {
      data: FamilyRelationship | null;
      error: string | null;
    };

    return payload;
  },
};
