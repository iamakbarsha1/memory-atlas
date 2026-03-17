import { describe, expect, it, vi } from "vitest";
import {
  createMemoryForRequest,
  deleteMemoryForRequest,
  listMemoriesForRequest,
  updateMemoryForRequest,
  type MemoryRequestDeps,
} from "./server";

function createDeps(): MemoryRequestDeps {
  return {
    isConfigured: true,
    getUserIdForToken: vi.fn().mockResolvedValue({
      userId: "user-123",
      error: null,
    }),
    ensureUserProfile: vi.fn().mockResolvedValue({ error: null }),
    repository: {
      create: vi.fn().mockResolvedValue({
        data: {
          id: "memory-1",
          title: "Khan Family Home",
          description: "Three generations lived here.",
          layer: "HOME",
          type: "HOME",
          latitude: "13.08",
          longitude: "80.27",
          person_id: null,
          user_id: "user-123",
          metadata: { personName: "Amina Khan" },
          media_urls: [],
          date_occurred: null,
          source_type: "FAMILY",
          source_name: "Interview",
          source_url: null,
          source_notes: "Recorded in 2024",
          trust_label: "FAMILY_CONFIRMED",
          sensitivity: "STANDARD",
          review_notes: null,
          respectful_handling_notes: null,
          reviewed_by: null,
          reviewed_at: null,
          hide_precise_location: false,
          visibility: "FAMILY",
          status: "DRAFT",
          created_at: "2026-03-17T10:00:00.000Z",
          updated_at: "2026-03-17T10:00:00.000Z",
        },
        error: null,
      }),
      listByUser: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
      update: vi.fn().mockResolvedValue({
        data: {
          id: "memory-1",
          title: "Updated title",
          description: "Three generations lived here.",
          layer: "HOME",
          type: "HOME",
          latitude: "13.08",
          longitude: "80.27",
          person_id: null,
          user_id: "user-123",
          metadata: { personName: "Amina Khan" },
          media_urls: [],
          date_occurred: null,
          source_type: "FAMILY",
          source_name: "Interview",
          source_url: null,
          source_notes: "Recorded in 2024",
          trust_label: "FAMILY_CONFIRMED",
          sensitivity: "STANDARD",
          review_notes: "Reviewed by family archivist",
          respectful_handling_notes: null,
          reviewed_by: "Archivist",
          reviewed_at: "2026-03-17T11:00:00.000Z",
          hide_precise_location: false,
          visibility: "FAMILY",
          status: "DRAFT",
          created_at: "2026-03-17T10:00:00.000Z",
          updated_at: "2026-03-17T11:00:00.000Z",
        },
        error: null,
      }),
      remove: vi.fn().mockResolvedValue({
        error: null,
      }),
    },
  };
}

describe("listMemoriesForRequest", () => {
  it("rejects unauthenticated requests", async () => {
    const result = await listMemoriesForRequest({}, createDeps());

    expect(result.status).toBe(401);
    expect(result.body.error).toMatch(/authorization/i);
  });

  it("passes the authenticated user and layer filter to the repository", async () => {
    const deps = createDeps();

    const result = await listMemoriesForRequest(
      { authorizationHeader: "Bearer token-123", layer: "HOME" },
      deps,
    );

    expect(deps.repository.listByUser).toHaveBeenCalledWith("user-123", {
      layer: "HOME",
    });
    expect(result.status).toBe(200);
  });

  it("passes search and browse filters through the list contract", async () => {
    const deps = createDeps();

    await listMemoriesForRequest(
      {
        authorizationHeader: "Bearer token-123",
        layer: "HOME",
        status: "DRAFT",
        sensitivity: "STANDARD",
        query: "amina",
        dateFrom: "1990-01-01",
        dateTo: "1995-01-01",
      },
      deps,
    );

    expect(deps.repository.listByUser).toHaveBeenCalledWith("user-123", {
      layer: "HOME",
      status: "DRAFT",
      sensitivity: "STANDARD",
      query: "amina",
      dateFrom: "1990-01-01",
      dateTo: "1995-01-01",
    });
  });
});

describe("createMemoryForRequest", () => {
  it("injects the authenticated user instead of trusting client userId", async () => {
    const deps = createDeps();

    const result = await createMemoryForRequest(
      {
        authorizationHeader: "Bearer token-123",
        body: {
          title: "Khan Family Home",
          layer: "HOME",
          type: "HOME",
          latitude: 13.08,
          longitude: 80.27,
          visibility: "FAMILY",
          status: "DRAFT",
          sourceType: "FAMILY",
          sourceName: "Interview",
          trustLabel: "FAMILY_CONFIRMED",
          sensitivity: "STANDARD",
          hidePreciseLocation: false,
          userId: "forged-user-id",
        },
      },
      deps,
    );

    expect(deps.repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
      }),
    );
    expect(deps.ensureUserProfile).toHaveBeenCalledWith("token-123", "user-123");
    expect(result.status).toBe(201);
  });

  it("returns validation errors with a 400 response", async () => {
    const deps = createDeps();

    const result = await createMemoryForRequest(
      {
        authorizationHeader: "Bearer token-123",
        body: {
          title: "",
          layer: "HOME",
          type: "HOME",
          latitude: 13.08,
          longitude: 80.27,
          visibility: "FAMILY",
          status: "DRAFT",
          sourceType: "FAMILY",
          sourceName: "",
          trustLabel: "UNVERIFIED",
          sensitivity: "STANDARD",
          hidePreciseLocation: false,
        },
      },
      deps,
    );

    expect(deps.repository.create).not.toHaveBeenCalled();
    expect(result.status).toBe(400);
    expect(result.body.validationErrors).toMatchObject({
      title: "Title is required.",
      sourceName: "Source name is required.",
    });
  });
});

describe("updateMemoryForRequest", () => {
  it("updates a user-owned record", async () => {
    const deps = createDeps();

    const result = await updateMemoryForRequest(
      {
        authorizationHeader: "Bearer token-123",
        memoryId: "memory-1",
        body: {
          title: "Updated title",
          layer: "HOME",
          type: "HOME",
          latitude: 13.08,
          longitude: 80.27,
          visibility: "FAMILY",
          status: "DRAFT",
          sourceType: "FAMILY",
          sourceName: "Interview",
          trustLabel: "FAMILY_CONFIRMED",
          sensitivity: "STANDARD",
          hidePreciseLocation: false,
        },
      },
      deps,
    );

    expect(deps.repository.update).toHaveBeenCalledWith(
      "memory-1",
      "user-123",
      expect.objectContaining({ title: "Updated title" }),
    );
    expect(result.status).toBe(200);
  });
});

describe("deleteMemoryForRequest", () => {
  it("deletes a user-owned record", async () => {
    const deps = createDeps();

    const result = await deleteMemoryForRequest(
      {
        authorizationHeader: "Bearer token-123",
        memoryId: "memory-1",
      },
      deps,
    );

    expect(deps.repository.remove).toHaveBeenCalledWith("memory-1", "user-123");
    expect(result.status).toBe(200);
  });
});
