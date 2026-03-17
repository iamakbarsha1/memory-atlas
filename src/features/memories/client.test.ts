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

    await memoryClientApi.listMemories("ignored-user-id", {
      layer: "HOME",
      placeName: "Chennai",
      status: "DRAFT",
      sensitivity: "STANDARD",
      query: "amina",
      dateFrom: "1990-01-01",
      dateTo: "1995-01-01",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/memories?layer=HOME&placeName=Chennai&status=DRAFT&sensitivity=STANDARD&query=amina&dateFrom=1990-01-01&dateTo=1995-01-01",
      {
        headers: {
          Authorization: "Bearer token-123",
        },
      },
    );
  });

  it("returns an auth error when no session token is available", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
    } as never);

    const result = await memoryClientApi.createMemory({
      title: "Test memory",
      placeName: "Chennai",
      layer: "HOME",
      type: "HOME",
      latitude: 13.08,
      longitude: 80.27,
      visibility: "PRIVATE",
      status: "DRAFT",
      sourceType: "FAMILY",
      sourceName: "Interview",
      trustLabel: "UNVERIFIED",
      sensitivity: "STANDARD",
      hidePreciseLocation: false,
      userId: "ignored",
    });

    expect(result.error).toMatch(/sign in/i);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls the memory detail endpoint for updates", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token-123" } },
    } as never);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: null, error: null }),
    });

    await memoryClientApi.updateMemory({
      id: "memory-1",
      title: "Updated memory",
      placeName: "Chennai",
      layer: "HOME",
      type: "HOME",
      latitude: 13.08,
      longitude: 80.27,
      visibility: "PRIVATE",
      status: "DRAFT",
      sourceType: "FAMILY",
      sourceName: "Interview",
      trustLabel: "FAMILY_CONFIRMED",
      sensitivity: "STANDARD",
      reviewNotes: "Checked against interview log",
      reviewedBy: "Archivist",
      reviewedAt: "2026-03-17",
      hidePreciseLocation: false,
      userId: "ignored",
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/memories/memory-1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({
        title: "Updated memory",
        placeName: "Chennai",
        layer: "HOME",
        type: "HOME",
        latitude: 13.08,
        longitude: 80.27,
        visibility: "PRIVATE",
        status: "DRAFT",
        sourceType: "FAMILY",
        sourceName: "Interview",
        trustLabel: "FAMILY_CONFIRMED",
        sensitivity: "STANDARD",
        reviewNotes: "Checked against interview log",
        reviewedBy: "Archivist",
        reviewedAt: "2026-03-17",
        hidePreciseLocation: false,
      }),
    });
  });

  it("calls the memory detail endpoint for deletes", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token-123" } },
    } as never);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ error: null }),
    });

    await memoryClientApi.deleteMemory("memory-1");

    expect(mockFetch).toHaveBeenCalledWith("/api/memories/memory-1", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer token-123",
      },
    });
  });
});
