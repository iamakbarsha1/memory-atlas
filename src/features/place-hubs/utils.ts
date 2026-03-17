import type { MemoryLayer, MemoryRecord } from "@/features/memories/types";
import { buildPartnerCollections, type PartnerCollection } from "@/features/partner-dashboard/analytics";

export type PlaceHub = {
  slug: string;
  placeName: string;
  aliases: string[];
  summary: string;
  centroid: { latitude: number; longitude: number };
  totalRecords: number;
  peopleCount: number;
  layers: MemoryLayer[];
  memories: MemoryRecord[];
  relatedCollections: PartnerCollection[];
};

export type PlaceFacet = {
  slug: string;
  placeName: string;
  aliases: string[];
  totalRecords: number;
};

const canonicalPlaceDefinitions = [
  {
    canonicalName: "Chennai",
    aliases: [
      "Madras",
      "Madras University Archive",
      "University of Madras",
      "Chennai Family Archive",
      "Chennai Port",
    ],
  },
  {
    canonicalName: "Madurai",
    aliases: ["Madurai City Archives"],
  },
  {
    canonicalName: "Dubai",
    aliases: ["Dubai Creek", "Green Gardens Cemetery"],
  },
] as const;

export function buildPlaceHubs(memories: MemoryRecord[]) {
  const grouped = new Map<string, MemoryRecord[]>();

  for (const memory of memories) {
    const placeName = resolveCanonicalPlaceName(memory.placeName);
    const slug = slugifyPlaceName(placeName);
    const current = grouped.get(slug) ?? [];
    current.push(memory);
    grouped.set(slug, current);
  }

  return Array.from(grouped.entries())
    .map<PlaceHub>(([slug, records]) => {
      const placeName = resolveCanonicalPlaceName(records[0].placeName);
      const aliases = Array.from(
        new Set(
          records
            .map((record) => record.placeName.trim())
            .filter((value) => value && value !== placeName),
        ),
      ).sort();
      const layers = Array.from(new Set(records.map((record) => record.layer))).sort();
      const peopleCount = new Set(
        records.map((record) => record.personName?.trim()).filter((value): value is string => Boolean(value)),
      ).size;

      return {
        slug,
        placeName,
        aliases,
        summary: buildPlaceSummary(placeName, aliases, records),
        centroid: {
          latitude: average(records.map((record) => record.latitude)),
          longitude: average(records.map((record) => record.longitude)),
        },
        totalRecords: records.length,
        peopleCount,
        layers,
        memories: [...records].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
        relatedCollections: buildPartnerCollections(records),
      };
    })
    .sort((left, right) => right.totalRecords - left.totalRecords || left.placeName.localeCompare(right.placeName));
}

export function getPlaceHubBySlug(memories: MemoryRecord[], slug: string) {
  return buildPlaceHubs(memories).find((hub) => hub.slug === slug) ?? null;
}

export function buildPlaceFacets(memories: MemoryRecord[]): PlaceFacet[] {
  return buildPlaceHubs(memories).map((hub) => ({
    slug: hub.slug,
    placeName: hub.placeName,
    aliases: hub.aliases,
    totalRecords: hub.totalRecords,
  }));
}

export function slugifyPlaceName(placeName: string) {
  return resolveCanonicalPlaceName(placeName)
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function inferPlaceName(memory: MemoryRecord) {
  return resolveCanonicalPlaceName(memory.placeName);
}

export function resolveCanonicalPlaceName(placeName: string) {
  const trimmedPlaceName = placeName.trim();

  if (!trimmedPlaceName) {
    return "Unknown place";
  }

  const normalizedPlaceName = normalizePlaceLookup(trimmedPlaceName);

  for (const definition of canonicalPlaceDefinitions) {
    const canonicalLookup = normalizePlaceLookup(definition.canonicalName);
    const aliasLookups = definition.aliases.map(normalizePlaceLookup);

    if (
      normalizedPlaceName === canonicalLookup ||
      aliasLookups.includes(normalizedPlaceName)
    ) {
      return definition.canonicalName;
    }
  }

  for (const definition of canonicalPlaceDefinitions) {
    const phrases = [definition.canonicalName, ...definition.aliases]
      .map(normalizePlaceLookup)
      .sort((left, right) => right.length - left.length);

    if (phrases.some((phrase) => normalizedPlaceName.includes(phrase))) {
      return definition.canonicalName;
    }
  }

  return titleCasePlaceName(trimmedPlaceName);
}

export const demoPlaceMemories: MemoryRecord[] = [
  {
    id: "demo-place-1",
    title: "Family Home Registry",
    description: "Chennai",
    placeName: "Chennai",
    layer: "HOME",
    type: "HOME",
    latitude: 13.0827,
    longitude: 80.2707,
    dateOccurred: "1992-06-14T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "PUBLISHED",
    sourceType: "FAMILY",
    sourceName: "Family interview",
    sourceUrl: null,
    sourceNotes: "Three generations lived nearby.",
    trustLabel: "FAMILY_CONFIRMED",
    sensitivity: "STANDARD",
    reviewNotes: "Approved for family place hub view.",
    respectfulHandlingNotes: null,
    reviewedBy: "Archivist",
    reviewedAt: "2026-03-18T00:00:00.000Z",
    hidePreciseLocation: false,
    institutionName: "Chennai Family Archive",
    reviewerAssignedTo: "Lead Archivist",
    reviewerAssignedAt: "2026-03-18T00:00:00.000Z",
    moderationDecisionNote: "Approved",
    importBatchId: null,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
  {
    id: "demo-place-2",
    title: "University Years",
    description: "Chennai",
    placeName: "Chennai",
    layer: "EDUCATION",
    type: "EDUCATION",
    latitude: 13.0674,
    longitude: 80.2376,
    dateOccurred: "2006-06-01T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "PUBLISHED",
    sourceType: "INSTITUTION",
    sourceName: "Madras University Archive",
    sourceUrl: null,
    sourceNotes: "Campus archive record.",
    trustLabel: "INSTITUTION_CONFIRMED",
    sensitivity: "STANDARD",
    reviewNotes: "Approved for campus history trail.",
    respectfulHandlingNotes: null,
    reviewedBy: "Campus Archivist",
    reviewedAt: "2026-03-18T00:00:00.000Z",
    hidePreciseLocation: false,
    institutionName: "Madras University Archive",
    reviewerAssignedTo: "Campus Archivist",
    reviewerAssignedAt: "2026-03-18T00:00:00.000Z",
    moderationDecisionNote: "Approved",
    importBatchId: null,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
  {
    id: "demo-place-3",
    title: "Birthplace Record",
    description: "Madurai",
    placeName: "Madurai",
    layer: "HISTORY",
    type: "BIRTH",
    latitude: 9.9252,
    longitude: 78.1198,
    dateOccurred: "1988-02-03T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    sourceType: "HISTORICAL",
    sourceName: "Madurai City Archives",
    sourceUrl: null,
    sourceNotes: "Birth registry district reference.",
    trustLabel: "HISTORICALLY_VERIFIED",
    sensitivity: "STANDARD",
    reviewNotes: "Published to local history collection.",
    respectfulHandlingNotes: null,
    reviewedBy: "City Curator",
    reviewedAt: "2026-03-18T00:00:00.000Z",
    hidePreciseLocation: false,
    institutionName: "Madurai City Archives",
    reviewerAssignedTo: "City Curator",
    reviewerAssignedAt: "2026-03-18T00:00:00.000Z",
    moderationDecisionNote: "Approved",
    importBatchId: null,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
  {
    id: "demo-place-4",
    title: "Memorial Registry",
    description: "Dubai",
    placeName: "Dubai",
    layer: "BURIAL",
    type: "BURIAL",
    latitude: 25.2048,
    longitude: 55.2708,
    dateOccurred: null,
    personName: "Yusuf Khan",
    visibility: "PRIVATE",
    status: "REVIEW",
    sourceType: "INSTITUTION",
    sourceName: "Green Gardens Cemetery",
    sourceUrl: null,
    sourceNotes: "Cemetery section B import.",
    trustLabel: "INSTITUTION_CONFIRMED",
    sensitivity: "MEMORIAL",
    reviewNotes: "Awaiting final family approval.",
    respectfulHandlingNotes: "Keep plot coordinates approximate in public views.",
    reviewedBy: null,
    reviewedAt: null,
    hidePreciseLocation: true,
    institutionName: "Green Gardens Cemetery",
    reviewerAssignedTo: "Lead Archivist",
    reviewerAssignedAt: "2026-03-18T00:00:00.000Z",
    moderationDecisionNote: "Awaiting review",
    importBatchId: "batch-demo-1",
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
];

function buildPlaceSummary(placeName: string, aliases: string[], records: MemoryRecord[]) {
  const layers = Array.from(new Set(records.map((record) => record.layer)));
  const partnerCount = new Set(
    records
      .map((record) => record.institutionName?.trim() || "")
      .filter(Boolean),
  ).size;

  const aliasSummary =
    aliases.length > 0
      ? ` It also absorbs ${aliases.length} alternate place labels.`
      : "";

  return `${placeName} currently gathers ${records.length} mapped memories across ${layers.length} layers and ${partnerCount} partner collections in this atlas view.${aliasSummary}`;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizePlaceLookup(placeName: string) {
  return placeName
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .replaceAll(/\s+/g, " ");
}

function titleCasePlaceName(placeName: string) {
  return placeName
    .trim()
    .split(/\s+/)
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}` : part))
    .join(" ");
}
