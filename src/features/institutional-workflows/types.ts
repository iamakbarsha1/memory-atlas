import type { CreateMemoryInput, MemoryRecord } from "@/features/memories/types";

export const moderationActionValues = ["SEND_TO_REVIEW", "PUBLISH", "ARCHIVE"] as const;

export type ModerationAction = (typeof moderationActionValues)[number];

export type ModerationAuditEntry = {
  id: string;
  memoryId: string;
  action: string;
  actorName: string | null;
  reviewerAssignedTo: string | null;
  institutionName: string | null;
  note: string | null;
  createdAt: string;
};

export type AssignReviewerInput = {
  memoryId: string;
  reviewerAssignedTo: string;
  actorName?: string;
  institutionName?: string;
  note?: string;
};

export type ModerateMemoryInput = {
  memoryId: string;
  action: ModerationAction;
  actorName: string;
  institutionName?: string;
  note: string;
};

export type ImportCsvInput = {
  csvText: string;
  institutionName: string;
  actorName: string;
  reviewerAssignedTo?: string;
};

export type ImportCsvResult = {
  importedCount: number;
  batchId: string;
  memories: MemoryRecord[];
  auditEntries: ModerationAuditEntry[];
};

export type InstitutionalExportRow = Pick<
  CreateMemoryInput,
  | "title"
  | "description"
  | "placeName"
  | "layer"
  | "type"
  | "latitude"
  | "longitude"
  | "dateOccurred"
  | "personName"
  | "visibility"
  | "status"
  | "sourceType"
  | "sourceName"
  | "sourceUrl"
  | "sourceNotes"
  | "trustLabel"
  | "sensitivity"
  | "reviewNotes"
  | "respectfulHandlingNotes"
  | "hidePreciseLocation"
> & {
  institutionName?: string;
  reviewerAssignedTo?: string;
};
