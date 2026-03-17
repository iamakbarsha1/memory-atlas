import { beforeEach, describe, expect, it, vi } from "vitest";
import { institutionalWorkflowClientApi } from "./client";
import { supabase } from "@/lib/supabase";

const mockFetch = vi.fn();

describe("institutionalWorkflowClientApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  it("posts reviewer assignments with auth", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token-123" } },
    } as never);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: null, error: null }),
    });

    await institutionalWorkflowClientApi.assignReviewer({
      memoryId: "memory-1",
      reviewerAssignedTo: "Lead Archivist",
      actorName: "Archivist",
      institutionName: "University Archive",
      note: "Needs review",
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/institutional-workflows/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({
        memoryId: "memory-1",
        reviewerAssignedTo: "Lead Archivist",
        actorName: "Archivist",
        institutionName: "University Archive",
        note: "Needs review",
      }),
    });
  });

  it("posts CSV imports with auth", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: "token-123" } },
    } as never);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: null, error: null }),
    });

    await institutionalWorkflowClientApi.importCsv({
      csvText: "title,description,placeName\nExample,Test,Chennai",
      institutionName: "Museum",
      actorName: "Archivist",
      reviewerAssignedTo: "Lead Archivist",
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/institutional-workflows/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
      },
      body: JSON.stringify({
        csvText: "title,description,placeName\nExample,Test,Chennai",
        institutionName: "Museum",
        actorName: "Archivist",
        reviewerAssignedTo: "Lead Archivist",
      }),
    });
  });
});
