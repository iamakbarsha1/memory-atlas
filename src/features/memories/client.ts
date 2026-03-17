import { supabase } from "@/lib/supabase";
import type { CreateMemoryInput, MemoryLayer, MemoryRecord } from "./types";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const memoryClientApi = {
  async listMemories(userId: string, options?: { layer?: MemoryLayer }) {
    void userId;
    const token = await getAccessToken();

    if (!token) {
      return { data: [], error: "Please sign in to view your memory records." };
    }

    const query = options?.layer ? `?layer=${options.layer}` : "";
    const response = await fetch(`/api/memories${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = (await response.json()) as { data: MemoryRecord[]; error: string | null };

    return {
      data: payload.data ?? [],
      error: payload.error,
    };
  },

  async createMemory(input: CreateMemoryInput) {
    const token = await getAccessToken();

    if (!token) {
      return {
        data: null,
        error: "Please sign in before creating a memory.",
        validationErrors: {},
      };
    }

    const { userId, ...body } = input;
    void userId;
    const response = await fetch("/api/memories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as {
      data: MemoryRecord | null;
      error: string | null;
      validationErrors?: Record<string, string>;
    };

    return {
      data: payload.data,
      error: payload.error,
      validationErrors: payload.validationErrors ?? {},
    };
  },
};
