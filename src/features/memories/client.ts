import { supabase } from "@/lib/supabase";
import type {
  CreateMemoryInput,
  MemoryListFilters,
  MemoryRecord,
  UpdateMemoryInput,
} from "./types";

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const memoryClientApi = {
  async listMemories(userId: string, options?: MemoryListFilters) {
    void userId;
    const token = await getAccessToken();

    if (!token) {
      return { data: [], error: "Please sign in to view your memory records." };
    }

    const params = new URLSearchParams();
    if (options?.layer) {
      params.set("layer", options.layer);
    }
    if (options?.status) {
      params.set("status", options.status);
    }
    if (options?.sensitivity) {
      params.set("sensitivity", options.sensitivity);
    }
    if (options?.query) {
      params.set("query", options.query);
    }
    if (options?.dateFrom) {
      params.set("dateFrom", options.dateFrom);
    }
    if (options?.dateTo) {
      params.set("dateTo", options.dateTo);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
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

  async updateMemory(input: UpdateMemoryInput) {
    const token = await getAccessToken();

    if (!token) {
      return {
        data: null,
        error: "Please sign in before updating a memory.",
        validationErrors: {},
      };
    }

    const { id, userId, ...body } = input;
    void userId;
    const response = await fetch(`/api/memories/${id}`, {
      method: "PATCH",
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

  async deleteMemory(memoryId: string) {
    const token = await getAccessToken();

    if (!token) {
      return {
        error: "Please sign in before deleting a memory.",
      };
    }

    const response = await fetch(`/api/memories/${memoryId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = (await response.json()) as {
      error: string | null;
    };

    return {
      error: payload.error,
    };
  },
};
