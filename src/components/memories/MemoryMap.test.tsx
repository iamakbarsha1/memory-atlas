import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryMap } from "./MemoryMap";
import type { MemoryRecord } from "@/features/memories/types";

const memories: MemoryRecord[] = [
  {
    id: "1",
    title: "Khan Family Home",
    description: "Chennai",
    placeName: "Chennai",
    layer: "HOME",
    type: "HOME",
    latitude: 13.0827,
    longitude: 80.2707,
    dateOccurred: "1992-06-14T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "DRAFT",
    sourceType: "FAMILY",
    sourceName: "Interview",
    sourceUrl: null,
    sourceNotes: "Recorded in 2024",
    trustLabel: "FAMILY_CONFIRMED",
    sensitivity: "STANDARD",
    reviewNotes: "",
    respectfulHandlingNotes: "",
    reviewedBy: null,
    reviewedAt: null,
    hidePreciseLocation: false,
    createdAt: "2026-03-17T10:00:00.000Z",
    updatedAt: "2026-03-17T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Grandfather Burial Plot",
    description: "Dubai cemetery",
    placeName: "Dubai",
    layer: "BURIAL",
    type: "BURIAL",
    latitude: 25.2048,
    longitude: 55.2708,
    dateOccurred: null,
    personName: "Yusuf Khan",
    visibility: "PRIVATE",
    status: "DRAFT",
    sourceType: "FAMILY",
    sourceName: "Family record",
    sourceUrl: null,
    sourceNotes: "Verified by family",
    trustLabel: "FAMILY_CONFIRMED",
    sensitivity: "MEMORIAL",
    reviewNotes: "Family review complete",
    respectfulHandlingNotes: "Share exact grave details only with immediate family.",
    reviewedBy: "Archivist",
    reviewedAt: "2026-03-17T10:00:00.000Z",
    hidePreciseLocation: true,
    createdAt: "2026-03-17T10:00:00.000Z",
    updatedAt: "2026-03-17T10:00:00.000Z",
  },
];

describe("MemoryMap", () => {
  it("renders one marker per memory and shows the active detail", () => {
    render(<MemoryMap memories={memories} selectedMemoryId="1" onSelectMemory={() => {}} />);

    expect(screen.getByRole("button", { name: /View Khan Family Home on map/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View Grandfather Burial Plot on map/i })).toBeInTheDocument();
    expect(screen.getByText(/Amina Khan/i)).toBeInTheDocument();
    expect(screen.getByText(/Oral history interview/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Family Confirmed/i)).toHaveLength(2);
  });

  it("calls onSelectMemory when a marker is pressed", () => {
    const onSelectMemory = vi.fn();

    render(<MemoryMap memories={memories} selectedMemoryId="1" onSelectMemory={onSelectMemory} />);

    fireEvent.click(screen.getByRole("button", { name: /View Grandfather Burial Plot on map/i }));

    expect(onSelectMemory).toHaveBeenCalledWith("2");
  });

  it("shows an empty state when there are no records", () => {
    render(<MemoryMap memories={[]} selectedMemoryId={null} onSelectMemory={() => {}} />);

    expect(screen.getByText(/No mapped records for this layer yet/i)).toBeInTheDocument();
  });
});
