import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlaceHubClient } from "./PlaceHubClient";

let mockUser: { id: string } | null = null;

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signOut: vi.fn(),
    session: null,
  }),
}));

describe("PlaceHubClient", () => {
  it("renders a canonical place hub from stored memories", async () => {
    mockUser = { id: "user-123" };
    const listMemories = vi.fn().mockResolvedValue({
      data: [
        {
          id: "1",
          title: "Family Home Registry",
          description: "Three generations lived nearby.",
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
          id: "2",
          title: "Birthplace Record",
          description: "Birth registry district reference.",
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
      ],
      error: null,
    });

    render(<PlaceHubClient slug="chennai" memoryApi={{ listMemories }} />);

    expect(await screen.findByRole("heading", { level: 1, name: /Chennai/i })).toBeInTheDocument();
    expect(screen.getByText(/Canonical Place Hub/i)).toBeInTheDocument();
    expect(screen.getByText("Partner Collections")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Madurai/i })).toBeInTheDocument();
  });

  it("shows an empty state when no stored place hub exists", async () => {
    mockUser = null;

    render(<PlaceHubClient slug="chennai" />);

    expect(await screen.findByRole("heading", { level: 1, name: /Place hub not found/i })).toBeInTheDocument();
    expect(screen.getByText(/Sign in and add memories with a place name/i)).toBeInTheDocument();
  });
});
