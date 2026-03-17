export const memoryLayerValues = ["BURIAL", "HOME", "EDUCATION", "HISTORY"] as const;
export const memoryTypeValues = [
  "BURIAL",
  "BIRTH",
  "HOME",
  "EDUCATION",
  "HISTORY",
  "MILESTONE",
] as const;
export const memoryVisibilityValues = ["PRIVATE", "FAMILY", "PUBLIC"] as const;
export const memoryStatusValues = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export const memorySourceTypeValues = [
  "FAMILY",
  "INSTITUTION",
  "HISTORICAL",
  "PERSONAL",
  "OTHER",
] as const;
export const memorySensitivityValues = ["STANDARD", "SENSITIVE", "MEMORIAL"] as const;
export const memoryTrustLabelValues = [
  "UNVERIFIED",
  "FAMILY_CONFIRMED",
  "INSTITUTION_CONFIRMED",
  "HISTORICALLY_VERIFIED",
] as const;

export type MemoryLayer = (typeof memoryLayerValues)[number];
export type MemoryType = (typeof memoryTypeValues)[number];
export type MemoryVisibility = (typeof memoryVisibilityValues)[number];
export type MemoryStatus = (typeof memoryStatusValues)[number];
export type MemorySourceType = (typeof memorySourceTypeValues)[number];
export type MemorySensitivity = (typeof memorySensitivityValues)[number];
export type MemoryTrustLabel = (typeof memoryTrustLabelValues)[number];

export type MemoryRecord = {
  id: string;
  title: string;
  description: string | null;
  placeName: string;
  layer: MemoryLayer;
  type: MemoryType;
  latitude: number;
  longitude: number;
  dateOccurred: string | null;
  personName: string | null;
  visibility: MemoryVisibility;
  status: MemoryStatus;
  sourceType: MemorySourceType;
  sourceName: string;
  sourceUrl: string | null;
  sourceNotes: string | null;
  trustLabel: MemoryTrustLabel;
  sensitivity: MemorySensitivity;
  reviewNotes: string | null;
  respectfulHandlingNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  hidePreciseLocation: boolean;
  institutionName?: string | null;
  reviewerAssignedTo?: string | null;
  reviewerAssignedAt?: string | null;
  moderationDecisionNote?: string | null;
  importBatchId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MemoryListFilters = {
  layer?: MemoryLayer;
  status?: MemoryStatus;
  sensitivity?: MemorySensitivity;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CreateMemoryInput = {
  title: string;
  description?: string;
  placeName: string;
  layer: MemoryLayer;
  type: MemoryType;
  latitude: number;
  longitude: number;
  dateOccurred?: string;
  personName?: string;
  visibility: MemoryVisibility;
  status: MemoryStatus;
  sourceType: MemorySourceType;
  sourceName: string;
  sourceUrl?: string;
  sourceNotes?: string;
  trustLabel: MemoryTrustLabel;
  sensitivity: MemorySensitivity;
  reviewNotes?: string;
  respectfulHandlingNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  hidePreciseLocation: boolean;
  institutionName?: string;
  reviewerAssignedTo?: string;
  reviewerAssignedAt?: string;
  moderationDecisionNote?: string;
  importBatchId?: string;
  userId: string;
};

export type UpdateMemoryInput = CreateMemoryInput & {
  id: string;
};

export type DatabaseMemoryRecord = {
  id: string;
  title: string;
  description: string | null;
  place_name?: string | null;
  layer: MemoryLayer;
  type: MemoryType;
  latitude: string | number;
  longitude: string | number;
  person_id: string | null;
  user_id: string | null;
  metadata: { personName?: string } | null;
  media_urls: string[] | null;
  date_occurred: string | null;
  source_type: MemorySourceType;
  source_name: string;
  source_url: string | null;
  source_notes: string | null;
  trust_label: MemoryTrustLabel;
  sensitivity: MemorySensitivity;
  review_notes: string | null;
  respectful_handling_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  hide_precise_location: boolean | null;
  institution_name?: string | null;
  reviewer_assigned_to?: string | null;
  reviewer_assigned_at?: string | null;
  moderation_decision_note?: string | null;
  import_batch_id?: string | null;
  visibility: MemoryVisibility;
  status: MemoryStatus;
  created_at: string;
  updated_at: string;
};
