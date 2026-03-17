import { describe, expect, it, vi } from "vitest";
import {
  createMemoryRecord,
  listMemoryRecords,
  deleteMemoryRecord,
  updateMemoryRecord,
  validateMemoryInput,
  type MemoryRepository,
} from "./service";
import type { CreateMemoryInput, DatabaseMemoryRecord } from "./types";

const baseInput: CreateMemoryInput = {
  title: "  Khan Family Home  ",
  description: "  Three generations lived here. ",
  layer: "HOME",
  type: "HOME",
  latitude: 13.0827,
  longitude: 80.2707,
  dateOccurred: "1992-06-14",
  visibility: "FAMILY",
  status: "DRAFT",
  sourceType: "FAMILY",
  sourceName: "  Oral history interview ",
  sourceNotes: "  Recorded in 2024 ",
  personName: "  Amina Khan ",
  userId: "user-123",
};

const dbRecord: DatabaseMemoryRecord = {
  id: "memory-1",
  title: "Khan Family Home",
  description: "Three generations lived here.",
  layer: "HOME",
  type: "HOME",
  latitude: "13.0827",
  longitude: "80.2707",
  person_id: null,
  user_id: "user-123",
  metadata: { personName: "Amina Khan" },
  media_urls: [],
  date_occurred: "1992-06-14T00:00:00.000Z",
  source_type: "FAMILY",
  source_name: "Oral history interview",
  source_url: null,
  source_notes: "Recorded in 2024",
  visibility: "FAMILY",
  status: "DRAFT",
  created_at: "2026-03-17T10:00:00.000Z",
  updated_at: "2026-03-17T10:00:00.000Z",
};

function createRepository(): MemoryRepository {
  return {
    create: vi.fn().mockResolvedValue({ data: dbRecord, error: null }),
    listByUser: vi.fn().mockResolvedValue({ data: [dbRecord], error: null }),
    update: vi.fn().mockResolvedValue({ data: dbRecord, error: null }),
    remove: vi.fn().mockResolvedValue({ error: null }),
  };
}

describe("validateMemoryInput", () => {
  it("normalizes a valid submission", () => {
    const result = validateMemoryInput(baseInput);

    expect(result.errors).toEqual({});
    expect(result.value).toMatchObject({
      title: "Khan Family Home",
      description: "Three generations lived here.",
      sourceName: "Oral history interview",
      sourceNotes: "Recorded in 2024",
      metadata: { personName: "Amina Khan" },
    });
  });

  it("rejects invalid coordinates and malformed source URLs", () => {
    const result = validateMemoryInput({
      ...baseInput,
      latitude: 91,
      longitude: -200,
      sourceUrl: "notaurl",
    });

    expect(result.value).toBeNull();
    expect(result.errors).toMatchObject({
      latitude: "Latitude must be between -90 and 90.",
      longitude: "Longitude must be between -180 and 180.",
      sourceUrl: "Source URL must be a valid URL.",
    });
  });
});

describe("createMemoryRecord", () => {
  it("sends normalized data to the repository and maps the response", async () => {
    const repository = createRepository();

    const result = await createMemoryRecord(baseInput, repository);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Khan Family Home",
        metadata: { personName: "Amina Khan" },
        source_name: "Oral history interview",
        visibility: "FAMILY",
      }),
    );
    expect(result.error).toBeNull();
    expect(result.data?.sourceName).toBe("Oral history interview");
    expect(result.data?.personName).toBe("Amina Khan");
  });

  it("returns validation errors before repository access", async () => {
    const repository = createRepository();

    const result = await createMemoryRecord(
      {
        ...baseInput,
        title: " ",
      },
      repository,
    );

    expect(repository.create).not.toHaveBeenCalled();
    expect(result.error).toBe("Please correct the highlighted fields.");
    expect(result.validationErrors).toMatchObject({
      title: "Title is required.",
    });
  });
});

describe("listMemoryRecords", () => {
  it("passes the layer filter through to the repository", async () => {
    const repository = createRepository();

    const result = await listMemoryRecords("user-123", { layer: "HOME" }, repository);

    expect(repository.listByUser).toHaveBeenCalledWith("user-123", { layer: "HOME" });
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].layer).toBe("HOME");
  });

  it("filters by query, status, and date range", async () => {
    const repository = createRepository();

    const result = await listMemoryRecords(
      "user-123",
      {
        query: "amina",
        status: "DRAFT",
        dateFrom: "1990-01-01",
        dateTo: "1995-01-01",
      },
      repository,
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe("Khan Family Home");
  });
});

describe("updateMemoryRecord", () => {
  it("sends the normalized payload to the repository", async () => {
    const repository = createRepository();

    const result = await updateMemoryRecord(
      {
        ...baseInput,
        id: "memory-1",
        title: "  Updated Home Record ",
      },
      repository,
    );

    expect(repository.update).toHaveBeenCalledWith(
      "memory-1",
      "user-123",
      expect.objectContaining({
        title: "Updated Home Record",
        source_name: "Oral history interview",
      }),
    );
    expect(result.data?.title).toBe("Khan Family Home");
  });
});

describe("deleteMemoryRecord", () => {
  it("passes the id and user through to the repository", async () => {
    const repository = createRepository();

    const result = await deleteMemoryRecord("memory-1", "user-123", repository);

    expect(repository.remove).toHaveBeenCalledWith("memory-1", "user-123");
    expect(result.error).toBeNull();
  });
});
