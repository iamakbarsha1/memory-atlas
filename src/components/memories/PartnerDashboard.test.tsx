import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartnerDashboard } from "./PartnerDashboard";
import type { MemoryRecord } from "@/features/memories/types";

const memories: MemoryRecord[] = [
  {
    id: "1",
    title: "North Gate Burial Registry",
    description: "Section B",
    layer: "BURIAL",
    type: "BURIAL",
    latitude: 25.2,
    longitude: 55.27,
    dateOccurred: null,
    personName: "Yusuf Khan",
    visibility: "PRIVATE",
    status: "REVIEW",
    sourceType: "INSTITUTION",
    sourceName: "Green Gardens Cemetery",
    sourceUrl: null,
    sourceNotes: "Registry import",
    trustLabel: "INSTITUTION_CONFIRMED",
    sensitivity: "MEMORIAL",
    reviewNotes: "Awaiting final cemetery confirmation",
    respectfulHandlingNotes: "Share exact plot only with family.",
    reviewedBy: null,
    reviewedAt: null,
    hidePreciseLocation: true,
    institutionName: "Green Gardens Cemetery",
    reviewerAssignedTo: "Lead Archivist",
    reviewerAssignedAt: null,
    moderationDecisionNote: null,
    importBatchId: "batch-1",
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Library Opening",
    description: "Campus library",
    layer: "EDUCATION",
    type: "EDUCATION",
    latitude: 13.08,
    longitude: 80.27,
    dateOccurred: "1998-06-01T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "PUBLISHED",
    sourceType: "INSTITUTION",
    sourceName: "Madras University Archive",
    sourceUrl: null,
    sourceNotes: "Alumni archive",
    trustLabel: "INSTITUTION_CONFIRMED",
    sensitivity: "STANDARD",
    reviewNotes: "Approved for alumni history view",
    respectfulHandlingNotes: null,
    reviewedBy: "Archivist",
    reviewedAt: "2026-03-18T00:00:00.000Z",
    hidePreciseLocation: false,
    institutionName: "Madras University Archive",
    reviewerAssignedTo: "Campus Archivist",
    reviewerAssignedAt: null,
    moderationDecisionNote: "Approved",
    importBatchId: null,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
];

describe("PartnerDashboard", () => {
  it("renders analytics, collections, and report views", () => {
    render(<PartnerDashboard memories={memories} />);

    expect(screen.getByText(/Partner Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Curated institutional collections/i)).toBeInTheDocument();
    expect(screen.getByText(/Green Gardens Cemetery Memorial Collection/i)).toBeInTheDocument();
    expect(screen.getByText(/Campus Archive View/i)).toBeInTheDocument();
  });
});
