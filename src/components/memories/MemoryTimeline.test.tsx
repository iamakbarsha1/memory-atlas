import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryTimeline } from "./MemoryTimeline";
import type { MemoryRecord } from "@/features/memories/types";

const memories: MemoryRecord[] = [
  {
    id: "1",
    title: "Birthplace",
    description: "Madurai",
    layer: "HISTORY",
    type: "BIRTH",
    latitude: 9.9252,
    longitude: 78.1198,
    dateOccurred: "1988-02-03T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "PUBLISHED",
    sourceType: "FAMILY",
    sourceName: "Family record",
    sourceUrl: null,
    sourceNotes: "Verified by family",
    trustLabel: "HISTORICALLY_VERIFIED",
    sensitivity: "STANDARD",
    reviewNotes: "Published after family review",
    respectfulHandlingNotes: "",
    reviewedBy: "Archive team",
    reviewedAt: "2026-03-17T10:00:00.000Z",
    hidePreciseLocation: false,
    createdAt: "2026-03-17T10:00:00.000Z",
    updatedAt: "2026-03-17T10:00:00.000Z",
  },
  {
    id: "2",
    title: "University Years",
    description: "Chennai",
    layer: "EDUCATION",
    type: "EDUCATION",
    latitude: 13.0827,
    longitude: 80.2707,
    dateOccurred: "2006-06-01T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "DRAFT",
    sourceType: "INSTITUTION",
    sourceName: "University archive",
    sourceUrl: null,
    sourceNotes: "Enrollment period",
    trustLabel: "INSTITUTION_CONFIRMED",
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
    id: "3",
    title: "Burial Site",
    description: "Dubai",
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
    sourceNotes: "Section B",
    trustLabel: "FAMILY_CONFIRMED",
    sensitivity: "MEMORIAL",
    reviewNotes: "Keep within family circle",
    respectfulHandlingNotes: "Do not surface exact grave marker publicly.",
    reviewedBy: "Family archivist",
    reviewedAt: "2026-03-17T10:00:00.000Z",
    hidePreciseLocation: true,
    createdAt: "2026-03-17T10:00:00.000Z",
    updatedAt: "2026-03-17T10:00:00.000Z",
  },
];

describe("MemoryTimeline", () => {
  it("renders person options and orders timeline items chronologically", () => {
    render(
      <MemoryTimeline
        memories={memories}
        selectedPerson="Amina Khan"
        selectedMemoryId="1"
        onSelectPerson={() => {}}
        onSelectMemory={() => {}}
      />,
    );

    expect(screen.getByRole("combobox", { name: /Timeline person/i })).toBeInTheDocument();
    const items = screen.getAllByRole("button", { name: /Open timeline memory/i });
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/Birthplace/i);
    expect(items[1]).toHaveTextContent(/University Years/i);
  });

  it("changes person and selects timeline items", () => {
    const onSelectPerson = vi.fn();
    const onSelectMemory = vi.fn();

    render(
      <MemoryTimeline
        memories={memories}
        selectedPerson="Amina Khan"
        selectedMemoryId="1"
        onSelectPerson={onSelectPerson}
        onSelectMemory={onSelectMemory}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: /Timeline person/i }), {
      target: { value: "Yusuf Khan" },
    });

    expect(onSelectPerson).toHaveBeenCalledWith("Yusuf Khan");
  });

  it("selects timeline items for the active person", () => {
    const onSelectMemory = vi.fn();

    render(
      <MemoryTimeline
        memories={memories}
        selectedPerson="Yusuf Khan"
        selectedMemoryId="3"
        onSelectPerson={() => {}}
        onSelectMemory={onSelectMemory}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Open timeline memory Burial Site/i }));

    expect(onSelectMemory).toHaveBeenCalledWith("3");
  });

  it("shows an empty state when no person-backed memories exist", () => {
    render(
      <MemoryTimeline
        memories={memories.map((memory) => ({ ...memory, personName: null }))}
        selectedPerson={null}
        selectedMemoryId={null}
        onSelectPerson={() => {}}
        onSelectMemory={() => {}}
      />,
    );

    expect(screen.getByText(/Add person names to memories to build a life timeline/i)).toBeInTheDocument();
  });
});
