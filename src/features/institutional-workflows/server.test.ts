import { describe, expect, it, vi } from "vitest";
import {
  assignReviewerForRequest,
  importCsvForRequest,
  moderateMemoryForRequest,
  type InstitutionalWorkflowDeps,
} from "./server";

function makeMemoryRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "memory-1",
    title: "Campus Memory",
    description: "Library steps",
    layer: "EDUCATION",
    type: "EDUCATION",
    latitude: "13.08",
    longitude: "80.27",
    person_id: null,
    user_id: "user-123",
    metadata: { personName: "Amina Khan" },
    media_urls: [],
    date_occurred: null,
    source_type: "INSTITUTION",
    source_name: "University archive",
    source_url: null,
    source_notes: "Catalogued by archive staff",
    trust_label: "INSTITUTION_CONFIRMED",
    sensitivity: "STANDARD",
    review_notes: null,
    respectful_handling_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    hide_precise_location: false,
    institution_name: "University Archive",
    reviewer_assigned_to: null,
    reviewer_assigned_at: null,
    moderation_decision_note: null,
    import_batch_id: null,
    visibility: "FAMILY",
    status: "DRAFT",
    created_at: "2026-03-18T00:00:00.000Z",
    updated_at: "2026-03-18T00:00:00.000Z",
    ...overrides,
  };
}

function createDeps(): InstitutionalWorkflowDeps {
  return {
    isConfigured: true,
    getUserIdForToken: vi.fn().mockResolvedValue({ userId: "user-123", error: null }),
    repository: {
      getMemoryById: vi.fn().mockResolvedValue({ data: makeMemoryRecord(), error: null }),
      updateMemoryWorkflow: vi.fn().mockResolvedValue({ data: makeMemoryRecord(), error: null }),
      createAuditLog: vi.fn().mockResolvedValue({
        data: {
          id: "audit-1",
          memoryId: "memory-1",
          action: "ASSIGN_REVIEWER",
          actorName: "Archivist",
          reviewerAssignedTo: "Lead Archivist",
          institutionName: "University Archive",
          note: "Needs archive verification",
          createdAt: "2026-03-18T00:00:00.000Z",
        },
        error: null,
      }),
      createMemoryRepository: vi.fn().mockReturnValue({
        create: vi.fn().mockResolvedValue({ data: makeMemoryRecord({ id: "memory-2" }), error: null }),
        listByUser: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
      }),
    },
  };
}

describe("assignReviewerForRequest", () => {
  it("assigns a reviewer and records an audit entry", async () => {
    const deps = createDeps();

    const result = await assignReviewerForRequest(
      {
        authorizationHeader: "Bearer token-123",
        body: {
          memoryId: "memory-1",
          reviewerAssignedTo: "Lead Archivist",
          actorName: "Archivist",
          institutionName: "University Archive",
          note: "Needs archive verification",
        },
      },
      deps,
    );

    expect(deps.repository.updateMemoryWorkflow).toHaveBeenCalledWith(
      "memory-1",
      "user-123",
      expect.objectContaining({
        reviewer_assigned_to: "Lead Archivist",
        institution_name: "University Archive",
      }),
    );
    expect(deps.repository.createAuditLog).toHaveBeenCalled();
    expect(result.status).toBe(200);
  });
});

describe("moderateMemoryForRequest", () => {
  it("publishes a memory and writes the decision note", async () => {
    const deps = createDeps();

    const result = await moderateMemoryForRequest(
      {
        authorizationHeader: "Bearer token-123",
        body: {
          memoryId: "memory-1",
          action: "PUBLISH",
          actorName: "Archivist",
          institutionName: "University Archive",
          note: "Approved for alumni history view.",
        },
      },
      deps,
    );

    expect(deps.repository.updateMemoryWorkflow).toHaveBeenCalledWith(
      "memory-1",
      "user-123",
      expect.objectContaining({
        status: "PUBLISHED",
        review_notes: "Approved for alumni history view.",
      }),
    );
    expect(result.status).toBe(200);
  });
});

describe("importCsvForRequest", () => {
  it("imports CSV rows into review state", async () => {
    const deps = createDeps();

    const result = await importCsvForRequest(
      {
        authorizationHeader: "Bearer token-123",
        body: {
          actorName: "Archivist",
          institutionName: "University Archive",
          reviewerAssignedTo: "Lead Archivist",
          csvText:
            "title,description,layer,type,latitude,longitude,dateOccurred,personName,visibility,status,sourceType,sourceName,sourceUrl,sourceNotes,trustLabel,sensitivity,reviewNotes,respectfulHandlingNotes,hidePreciseLocation,institutionName,reviewerAssignedTo\n" +
            "Library Opening,Main campus library,HISTORY,HISTORY,13.08,80.27,1998-06-01,Amina Khan,FAMILY,REVIEW,INSTITUTION,University archive,,Catalog,FAMILY_CONFIRMED,STANDARD,Imported review,,false,University Archive,Lead Archivist",
        },
      },
      deps,
    );

    expect(deps.repository.createMemoryRepository).toHaveBeenCalled();
    expect(result.status).toBe(201);
    expect(result.body.data).toMatchObject({
      importedCount: 1,
    });
  });
});
