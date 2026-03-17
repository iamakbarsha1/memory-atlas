import type { MemoryRecord } from "@/features/memories/types";
import type { InstitutionalExportRow } from "./types";

const exportHeaders = [
  "title",
  "description",
  "placeName",
  "layer",
  "type",
  "latitude",
  "longitude",
  "dateOccurred",
  "personName",
  "visibility",
  "status",
  "sourceType",
  "sourceName",
  "sourceUrl",
  "sourceNotes",
  "trustLabel",
  "sensitivity",
  "reviewNotes",
  "respectfulHandlingNotes",
  "hidePreciseLocation",
  "institutionName",
  "reviewerAssignedTo",
] as const;

type ExportHeader = (typeof exportHeaders)[number];

export function buildInstitutionalExportCsv(memories: MemoryRecord[]) {
  const rows = memories.map<InstitutionalExportRow>((memory) => ({
    title: memory.title,
    description: memory.description ?? "",
    placeName: memory.placeName,
    layer: memory.layer,
    type: memory.type,
    latitude: memory.latitude,
    longitude: memory.longitude,
    dateOccurred: memory.dateOccurred ? memory.dateOccurred.slice(0, 10) : "",
    personName: memory.personName ?? "",
    visibility: memory.visibility,
    status: memory.status,
    sourceType: memory.sourceType,
    sourceName: memory.sourceName,
    sourceUrl: memory.sourceUrl ?? "",
    sourceNotes: memory.sourceNotes ?? "",
    trustLabel: memory.trustLabel,
    sensitivity: memory.sensitivity,
    reviewNotes: memory.reviewNotes ?? "",
    respectfulHandlingNotes: memory.respectfulHandlingNotes ?? "",
    hidePreciseLocation: memory.hidePreciseLocation,
    institutionName: memory.institutionName ?? "",
    reviewerAssignedTo: memory.reviewerAssignedTo ?? "",
  }));

  return [exportHeaders.join(","), ...rows.map((row) => serializeRow(row))].join("\n");
}

export function parseInstitutionalCsv(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    return { rows: [] as InstitutionalExportRow[], error: "CSV content is required." };
  }

  const lines = splitCsvLines(normalized);
  if (lines.length < 2) {
    return { rows: [] as InstitutionalExportRow[], error: "CSV must include a header row and at least one data row." };
  }

  const headers = parseCsvLine(lines[0]);
  const unknownHeaders = headers.filter((header) => !exportHeaders.includes(header as ExportHeader));

  if (unknownHeaders.length > 0) {
    return {
      rows: [] as InstitutionalExportRow[],
      error: `Unsupported CSV headers: ${unknownHeaders.join(", ")}.`,
    };
  }

  const rows: InstitutionalExportRow[] = [];

  for (const line of lines.slice(1)) {
    if (!line.trim()) {
      continue;
    }

    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as Record<string, string>;

    rows.push({
      title: row.title ?? "",
      description: row.description ?? "",
      placeName: row.placeName ?? "",
      layer: (row.layer as InstitutionalExportRow["layer"]) ?? "HOME",
      type: (row.type as InstitutionalExportRow["type"]) ?? "HOME",
      latitude: Number(row.latitude ?? Number.NaN),
      longitude: Number(row.longitude ?? Number.NaN),
      dateOccurred: row.dateOccurred ?? "",
      personName: row.personName ?? "",
      visibility: (row.visibility as InstitutionalExportRow["visibility"]) ?? "PRIVATE",
      status: (row.status as InstitutionalExportRow["status"]) ?? "DRAFT",
      sourceType: (row.sourceType as InstitutionalExportRow["sourceType"]) ?? "FAMILY",
      sourceName: row.sourceName ?? "",
      sourceUrl: row.sourceUrl ?? "",
      sourceNotes: row.sourceNotes ?? "",
      trustLabel: (row.trustLabel as InstitutionalExportRow["trustLabel"]) ?? "UNVERIFIED",
      sensitivity: (row.sensitivity as InstitutionalExportRow["sensitivity"]) ?? "STANDARD",
      reviewNotes: row.reviewNotes ?? "",
      respectfulHandlingNotes: row.respectfulHandlingNotes ?? "",
      hidePreciseLocation: row.hidePreciseLocation === "true",
      institutionName: row.institutionName ?? "",
      reviewerAssignedTo: row.reviewerAssignedTo ?? "",
    });
  }

  return { rows, error: null };
}

function serializeRow(row: InstitutionalExportRow) {
  return exportHeaders
    .map((header) => escapeCsvValue(formatValue(row[header])))
    .join(",");
}

function formatValue(value: InstitutionalExportRow[ExportHeader]) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return value ?? "";
}

function escapeCsvValue(value: string | number) {
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function splitCsvLines(input: string) {
  return input.split(/\r?\n/);
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);
  return values.map((value) => value.trim());
}
