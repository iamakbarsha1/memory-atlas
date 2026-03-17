import { beforeEach, describe, expect, it, vi } from "vitest";
import { memoryClientApi } from "./client";
import { supabase } from "@/lib/supabase";

const mockFetch = vi.fn();

describe("memoryClientApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  it("includes the bearer token when listing memories", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token-123" } },
    } as never);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], error: null }),
    });

    await memoryClientApi.listMemories("ignored-user-id", { layer: "HOME" });

    expect(mockFetch).toHaveBeenCalledWith("/api/memories?layer=HOME", {
      headers: {
        Authorization: "Bearer token-123",
      },
    });
  });

  it("returns an auth error when no session token is available", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
    } as never);

    const result = await memoryClientApi.createMemory({
      title: "Test memory",
      layer: "HOME",
      type: "HOME",
      latitude: 13.08,
      longitude: 80.27,
      visibility: "PRIVATE",
      status: "DRAFT",
      sourceType: "FAMILY",
      sourceName: "Interview",
      userId: "ignored",
    });

    expect(result.error).toMatch(/sign in/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
