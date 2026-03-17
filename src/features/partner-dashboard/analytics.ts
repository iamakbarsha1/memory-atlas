import type { MemoryLayer, MemoryRecord } from "@/features/memories/types";

export type PartnerSector = "CEMETERY" | "CAMPUS" | "MUSEUM_CITY";

export type PartnerCollection = {
  id: string;
  institutionName: string;
  sector: PartnerSector;
  title: string;
  totalRecords: number;
  publishedRecords: number;
  reviewRecords: number;
  verifiedRecords: number;
  layers: MemoryLayer[];
  featuredTitles: string[];
  latestUpdatedAt: string;
};

export type PartnerDashboardAnalytics = {
  totalInstitutions: number;
  totalCollections: number;
  totalRecords: number;
  publishedRecords: number;
  reviewQueueRecords: number;
  verifiedRecords: number;
  memorialRecords: number;
  byLayer: Record<MemoryLayer, number>;
};

export type PartnerReportView = {
  sector: PartnerSector;
  label: string;
  totalCollections: number;
  totalRecords: number;
  publishedRecords: number;
  reviewQueueRecords: number;
  verifiedRecords: number;
  topInstitution: string;
  focusSummary: string;
};

export function buildPartnerCollections(memories: MemoryRecord[]) {
  const grouped = new Map<string, MemoryRecord[]>();

  for (const memory of memories) {
    const institutionName = inferInstitutionName(memory);
    const current = grouped.get(institutionName) ?? [];
    current.push(memory);
    grouped.set(institutionName, current);
  }

  return Array.from(grouped.entries())
    .map<PartnerCollection>(([institutionName, records]) => {
      const sector = inferSector(records);
      const layers = Array.from(new Set(records.map((record) => record.layer))).sort();
      const sortedByUpdated = [...records].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

      return {
        id: institutionName.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, ""),
        institutionName,
        sector,
        title: `${institutionName} ${sectorTitleMap[sector]}`,
        totalRecords: records.length,
        publishedRecords: records.filter((record) => record.status === "PUBLISHED").length,
        reviewRecords: records.filter((record) => record.status === "REVIEW").length,
        verifiedRecords: records.filter((record) => record.trustLabel !== "UNVERIFIED").length,
        layers,
        featuredTitles: sortedByUpdated.slice(0, 3).map((record) => record.title),
        latestUpdatedAt: sortedByUpdated[0]?.updatedAt ?? "",
      };
    })
    .sort((left, right) => right.totalRecords - left.totalRecords || left.title.localeCompare(right.title));
}

export function buildPartnerDashboardAnalytics(memories: MemoryRecord[]): PartnerDashboardAnalytics {
  const collections = buildPartnerCollections(memories);

  return {
    totalInstitutions: collections.length,
    totalCollections: collections.length,
    totalRecords: memories.length,
    publishedRecords: memories.filter((record) => record.status === "PUBLISHED").length,
    reviewQueueRecords: memories.filter((record) => record.status === "REVIEW").length,
    verifiedRecords: memories.filter((record) => record.trustLabel !== "UNVERIFIED").length,
    memorialRecords: memories.filter((record) => record.sensitivity === "MEMORIAL").length,
    byLayer: {
      BURIAL: memories.filter((record) => record.layer === "BURIAL").length,
      HOME: memories.filter((record) => record.layer === "HOME").length,
      EDUCATION: memories.filter((record) => record.layer === "EDUCATION").length,
      HISTORY: memories.filter((record) => record.layer === "HISTORY").length,
    },
  };
}

export function buildPartnerReportViews(memories: MemoryRecord[]) {
  const collections = buildPartnerCollections(memories);

  return (["CEMETERY", "CAMPUS", "MUSEUM_CITY"] as const).map<PartnerReportView>((sector) => {
    const sectorCollections = collections.filter((collection) => collection.sector === sector);
    const sectorRecords = memories.filter((memory) => inferSector([memory]) === sector);
    const topInstitution = sectorCollections[0]?.institutionName ?? "No active partner";

    return {
      sector,
      label: sectorLabelMap[sector],
      totalCollections: sectorCollections.length,
      totalRecords: sectorRecords.length,
      publishedRecords: sectorRecords.filter((record) => record.status === "PUBLISHED").length,
      reviewQueueRecords: sectorRecords.filter((record) => record.status === "REVIEW").length,
      verifiedRecords: sectorRecords.filter((record) => record.trustLabel !== "UNVERIFIED").length,
      topInstitution,
      focusSummary: buildSectorSummary(sector, sectorCollections, sectorRecords),
    };
  });
}

function inferInstitutionName(memory: MemoryRecord) {
  if (memory.institutionName?.trim()) {
    return memory.institutionName.trim();
  }

  if (memory.sourceType === "INSTITUTION" || memory.sourceType === "HISTORICAL") {
    return memory.sourceName;
  }

  return "Independent Archive";
}

function inferSector(records: MemoryRecord[]): PartnerSector {
  const burialCount = records.filter((record) => record.layer === "BURIAL").length;
  const educationCount = records.filter((record) => record.layer === "EDUCATION").length;
  const historyCount = records.filter((record) => record.layer === "HISTORY").length;

  if (burialCount >= educationCount && burialCount >= historyCount) {
    return "CEMETERY";
  }

  if (educationCount >= historyCount) {
    return "CAMPUS";
  }

  return "MUSEUM_CITY";
}

function buildSectorSummary(
  sector: PartnerSector,
  collections: PartnerCollection[],
  records: MemoryRecord[],
) {
  if (collections.length === 0) {
    return sectorEmptyStateMap[sector];
  }

  const publishedRecords = records.filter((record) => record.status === "PUBLISHED").length;
  const reviewRecords = records.filter((record) => record.status === "REVIEW").length;

  if (sector === "CEMETERY") {
    return `${collections.length} cemetery-facing collections with ${publishedRecords} published memorial records and ${reviewRecords} records still in review.`;
  }

  if (sector === "CAMPUS") {
    return `${collections.length} campus collections covering alumni, buildings, and educational journeys across ${publishedRecords} published records.`;
  }

  return `${collections.length} museum or city-history collections with ${publishedRecords} published stories and ${reviewRecords} items awaiting curatorial review.`;
}

const sectorTitleMap: Record<PartnerSector, string> = {
  CEMETERY: "Memorial Collection",
  CAMPUS: "Campus Collection",
  MUSEUM_CITY: "History Collection",
};

const sectorLabelMap: Record<PartnerSector, string> = {
  CEMETERY: "Cemetery Operator View",
  CAMPUS: "Campus Archive View",
  MUSEUM_CITY: "Museum / City Partner View",
};

const sectorEmptyStateMap: Record<PartnerSector, string> = {
  CEMETERY: "No cemetery operator collections are represented in the current filtered view yet.",
  CAMPUS: "No campus archive collections are represented in the current filtered view yet.",
  MUSEUM_CITY: "No museum or city partner collections are represented in the current filtered view yet.",
};
