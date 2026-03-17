import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FamilyAtlas } from "./FamilyAtlas";
import type { MemoryRecord } from "@/features/memories/types";

const memories: MemoryRecord[] = [
  {
    id: "1",
    title: "Family Home",
    description: "Chennai",
    placeName: "Chennai",
    layer: "HOME",
    type: "HOME",
    latitude: 13.0827,
    longitude: 80.2707,
    dateOccurred: "1998-01-01T00:00:00.000Z",
    personName: "Amina Khan",
    visibility: "FAMILY",
    status: "DRAFT",
    sourceType: "FAMILY",
    sourceName: "Family record",
    sourceUrl: null,
    sourceNotes: "Shared address",
    trustLabel: "FAMILY_CONFIRMED",
    sensitivity: "STANDARD",
    reviewNotes: "",
    respectfulHandlingNotes: "",
    reviewedBy: null,
    reviewedAt: null,
    hidePreciseLocation: false,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
  {
    id: "2",
    title: "Burial Site",
    description: "Dubai",
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
    sourceNotes: "Section B",
    trustLabel: "FAMILY_CONFIRMED",
    sensitivity: "MEMORIAL",
    reviewNotes: "Family-only memorial record",
    respectfulHandlingNotes: "Do not share exact grave marker publicly.",
    reviewedBy: "Family archivist",
    reviewedAt: "2026-03-18T00:00:00.000Z",
    hidePreciseLocation: true,
    createdAt: "2026-03-18T00:00:00.000Z",
    updatedAt: "2026-03-18T00:00:00.000Z",
  },
];

describe("FamilyAtlas", () => {
  it("loads the family graph and shared footprint", async () => {
    const atlasApi = {
      loadAtlas: vi.fn().mockResolvedValue({
        data: {
          people: [
            {
              id: "person-1",
              firstName: "Amina",
              lastName: "Khan",
              fullName: "Amina Khan",
              birthDate: null,
              deathDate: null,
              bio: null,
              userId: "user-123",
              createdAt: "2026-03-18T00:00:00.000Z",
            },
          ],
          relationships: [],
        },
        error: null,
      }),
      createPerson: vi.fn(),
      createRelationship: vi.fn(),
    };

    render(<FamilyAtlas memories={memories} atlasApi={atlasApi} />);

    await screen.findByRole("button", { name: /Link Family Members/i });
    expect(screen.getByText(/Shared family footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/1 mapped memories/i)).toBeInTheDocument();
  });

  it("creates a family member", async () => {
    const atlasApi = {
      loadAtlas: vi.fn().mockResolvedValue({
        data: { people: [], relationships: [] },
        error: null,
      }),
      createPerson: vi.fn().mockResolvedValue({
        data: {
          id: "person-1",
          firstName: "Fatima",
          lastName: "Khan",
          fullName: "Fatima Khan",
          birthDate: null,
          deathDate: null,
          bio: null,
          userId: "user-123",
          createdAt: "2026-03-18T00:00:00.000Z",
        },
        error: null,
      }),
      createRelationship: vi.fn(),
    };

    render(<FamilyAtlas memories={memories} atlasApi={atlasApi} />);

    fireEvent.change(screen.getByLabelText(/Family first name/i), {
      target: { value: "Fatima" },
    });
    fireEvent.change(screen.getByLabelText(/Family last name/i), {
      target: { value: "Khan" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add Family Member/i }));

    await waitFor(() => {
      expect(atlasApi.createPerson).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "Fatima",
          lastName: "Khan",
        }),
      );
    });
  });

  it("creates a relationship between family members", async () => {
    const atlasApi = {
      loadAtlas: vi.fn().mockResolvedValue({
        data: {
          people: [
            {
              id: "person-1",
              firstName: "Amina",
              lastName: "Khan",
              fullName: "Amina Khan",
              birthDate: null,
              deathDate: null,
              bio: null,
              userId: "user-123",
              createdAt: "2026-03-18T00:00:00.000Z",
            },
            {
              id: "person-2",
              firstName: "Yusuf",
              lastName: "Khan",
              fullName: "Yusuf Khan",
              birthDate: null,
              deathDate: null,
              bio: null,
              userId: "user-123",
              createdAt: "2026-03-18T00:00:00.000Z",
            },
          ],
          relationships: [],
        },
        error: null,
      }),
      createPerson: vi.fn(),
      createRelationship: vi.fn().mockResolvedValue({
        data: {
          id: "relationship-1",
          personId: "person-1",
          relatedPersonId: "person-2",
          type: "CHILD",
          createdAt: "2026-03-18T00:00:00.000Z",
        },
        error: null,
      }),
    };

    render(<FamilyAtlas memories={memories} atlasApi={atlasApi} />);

    await screen.findByRole("button", { name: /Link Family Members/i });
    fireEvent.change(screen.getByLabelText(/Relationship type/i), {
      target: { value: "CHILD" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Link Family Members/i }));

    await waitFor(() => {
      expect(atlasApi.createRelationship).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "CHILD",
        }),
      );
    });
  });
});
