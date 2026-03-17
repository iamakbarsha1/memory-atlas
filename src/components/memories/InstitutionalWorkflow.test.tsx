import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstitutionalWorkflow } from "./InstitutionalWorkflow";

const memories = [
  {
    id: "memory-1",
    title: "Campus Memory",
    description: "Library steps",
    placeName: "Chennai",
    layer: "EDUCATION",
    type: "EDUCATION",
    latitude: 13.08,
    longitude: 80.27,
    dateOccurred: "1998-06-01T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "REVIEW",
    sourceType: "INSTITUTION",
    sourceName: "University archive",
    sourceUrl: null,
    sourceNotes: "Catalogued by archive staff",
    trustLabel: "INSTITUTION_CONFIRMED",
    sensitivity: "STANDARD",
    reviewNotes: "Ready for review",
    respectfulHandlingNotes: null,
    reviewedBy: null,
    reviewedAt: null,
    hidePreciseLocation: false,
    institutionName: "University Archive",
    reviewerAssignedTo: "Lead Archivist",
    reviewerAssignedAt: null,
    moderationDecisionNote: "Ready for institutional review.",
    importBatchId: null,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
];

describe("InstitutionalWorkflow", () => {
  it("assigns a reviewer and refreshes memories", async () => {
    const onRefreshMemories = vi.fn().mockResolvedValue(undefined);
    const workflowApi = {
      assignReviewer: vi.fn().mockResolvedValue({
        data: {
          memoryId: "memory-1",
          auditEntry: {
            id: "audit-1",
            memoryId: "memory-1",
            action: "ASSIGN_REVIEWER",
            actorName: "Archivist",
            reviewerAssignedTo: "Lead Archivist",
            institutionName: "University Archive",
            note: "Needs review",
            createdAt: "2026-03-18T00:00:00.000Z",
          },
        },
        error: null,
      }),
      reviewMemory: vi.fn(),
      importCsv: vi.fn(),
    };

    render(
      <InstitutionalWorkflow
        memories={memories}
        onRefreshMemories={onRefreshMemories}
        workflowApi={workflowApi}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Assign Reviewer/i }));

    await waitFor(() => {
      expect(workflowApi.assignReviewer).toHaveBeenCalledWith(
        expect.objectContaining({
          memoryId: "memory-1",
          reviewerAssignedTo: "Lead Archivist",
        }),
      );
    });
    expect(onRefreshMemories).toHaveBeenCalled();
  });

  it("imports a csv batch", async () => {
    const onRefreshMemories = vi.fn().mockResolvedValue(undefined);
    const workflowApi = {
      assignReviewer: vi.fn(),
      reviewMemory: vi.fn(),
      importCsv: vi.fn().mockResolvedValue({
        data: {
          importedCount: 1,
          batchId: "batch-1",
          auditEntries: [],
        },
        error: null,
      }),
    };

    render(
      <InstitutionalWorkflow
        memories={memories}
        onRefreshMemories={onRefreshMemories}
        workflowApi={workflowApi}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Institutional import csv/i), {
      target: {
        value:
          "title,description,placeName,layer,type,latitude,longitude,dateOccurred,personName,visibility,status,sourceType,sourceName,sourceUrl,sourceNotes,trustLabel,sensitivity,reviewNotes,respectfulHandlingNotes,hidePreciseLocation,institutionName,reviewerAssignedTo\n" +
          "Library Opening,Main campus library,Chennai,HISTORY,HISTORY,13.08,80.27,1998-06-01,Amina Khan,FAMILY,REVIEW,INSTITUTION,University archive,,Catalog,INSTITUTION_CONFIRMED,STANDARD,Ready for review,,false,University Archive,Lead Archivist",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /Import CSV Batch/i }));

    await waitFor(() => {
      expect(workflowApi.importCsv).toHaveBeenCalled();
    });
    expect(onRefreshMemories).toHaveBeenCalled();
  });
});
