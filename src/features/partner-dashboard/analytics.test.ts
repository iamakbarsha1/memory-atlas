import { describe, expect, it } from "vitest";
import {
  buildPartnerCollections,
  buildPartnerDashboardAnalytics,
  buildPartnerReportViews,
} from "./analytics";
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
  {
    id: "3",
    title: "Dockworkers Exhibit",
    description: "Maritime labor story",
    layer: "HISTORY",
    type: "HISTORY",
    latitude: 13.09,
    longitude: 80.29,
    dateOccurred: "1970-01-01T00:00:00.000Z",
    personName: null,
    visibility: "PUBLIC",
    status: "PUBLISHED",
    sourceType: "HISTORICAL",
    sourceName: "City Museum",
    sourceUrl: null,
    sourceNotes: "Curated exhibition",
    trustLabel: "HISTORICALLY_VERIFIED",
    sensitivity: "STANDARD",
    reviewNotes: "Published for local history trail",
    respectfulHandlingNotes: null,
    reviewedBy: "Curator",
    reviewedAt: "2026-03-18T00:00:00.000Z",
    hidePreciseLocation: false,
    institutionName: "City Museum",
    reviewerAssignedTo: "City Curator",
    reviewerAssignedAt: null,
    moderationDecisionNote: "Approved",
    importBatchId: null,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
];

describe("partner dashboard analytics", () => {
  it("builds curated partner collections", () => {
    const collections = buildPartnerCollections(memories);

    expect(collections).toHaveLength(3);
    expect(collections[0]).toMatchObject({
      institutionName: "City Museum",
      sector: "MUSEUM_CITY",
    });
  });

  it("computes top-level analytics", () => {
    const analytics = buildPartnerDashboardAnalytics(memories);

    expect(analytics).toMatchObject({
      totalInstitutions: 3,
      totalRecords: 3,
      publishedRecords: 2,
      reviewQueueRecords: 1,
      memorialRecords: 1,
    });
  });

  it("builds sector report views", () => {
    const reports = buildPartnerReportViews(memories);

    expect(reports).toHaveLength(3);
    expect(reports.find((report) => report.sector === "CAMPUS")).toMatchObject({
      totalRecords: 1,
      topInstitution: "Madras University Archive",
    });
  });
});
