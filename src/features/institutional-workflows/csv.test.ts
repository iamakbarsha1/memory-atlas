import { describe, expect, it } from "vitest";
import { buildInstitutionalExportCsv, parseInstitutionalCsv } from "./csv";

describe("institutional workflow csv helpers", () => {
  it("serializes the memory export format", () => {
    const csv = buildInstitutionalExportCsv([
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
        moderationDecisionNote: null,
        importBatchId: null,
        createdAt: "2026-03-18T00:00:00.000Z",
        updatedAt: "2026-03-18T00:00:00.000Z",
      },
    ]);

    expect(csv).toContain("title,description,placeName,layer,type");
    expect(csv).toContain("Campus Memory");
  });

  it("parses an import csv row", () => {
    const result = parseInstitutionalCsv(
      "title,description,placeName,layer,type,latitude,longitude,dateOccurred,personName,visibility,status,sourceType,sourceName,sourceUrl,sourceNotes,trustLabel,sensitivity,reviewNotes,respectfulHandlingNotes,hidePreciseLocation,institutionName,reviewerAssignedTo\n" +
        "Campus Memory,Library steps,Chennai,EDUCATION,EDUCATION,13.08,80.27,1998-06-01,Amina Khan,FAMILY,REVIEW,INSTITUTION,University archive,,Catalogued,INSTITUTION_CONFIRMED,STANDARD,Ready for review,,false,University Archive,Lead Archivist",
    );

    expect(result.error).toBeNull();
    expect(result.rows[0]).toMatchObject({
      title: "Campus Memory",
      placeName: "Chennai",
      reviewerAssignedTo: "Lead Archivist",
      institutionName: "University Archive",
    });
  });
});
