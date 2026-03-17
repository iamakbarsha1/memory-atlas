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

export type MemoryLayer = (typeof memoryLayerValues)[number];
export type MemoryType = (typeof memoryTypeValues)[number];
export type MemoryVisibility = (typeof memoryVisibilityValues)[number];
export type MemoryStatus = (typeof memoryStatusValues)[number];
export type MemorySourceType = (typeof memorySourceTypeValues)[number];

export type MemoryRecord = {
  id: string;
  title: string;
  description: string | null;
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
  createdAt: string;
  updatedAt: string;
};

export type MemoryListFilters = {
  layer?: MemoryLayer;
  status?: MemoryStatus;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CreateMemoryInput = {
  title: string;
  description?: string;
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
  userId: string;
};

export type UpdateMemoryInput = CreateMemoryInput & {
  id: string;
};

export type DatabaseMemoryRecord = {
  id: string;
  title: string;
  description: string | null;
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
  visibility: MemoryVisibility;
  status: MemoryStatus;
  created_at: string;
  updated_at: string;
};
