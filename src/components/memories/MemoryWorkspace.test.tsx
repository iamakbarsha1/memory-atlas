import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryWorkspace } from "./MemoryWorkspace";

vi.mock("@/components/globe/GlobeScene", () => ({
  GlobeScene: () => <div>Workspace Globe</div>,
}));

describe("MemoryWorkspace", () => {
  it("loads records and filters them by layer", async () => {
    const listMemories = vi.fn().mockResolvedValue({
      data: [
        {
          id: "1",
          title: "Khan Family Home",
          description: "Chennai",
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
          createdAt: "2026-03-17T10:00:00.000Z",
          updatedAt: "2026-03-17T10:00:00.000Z",
        },
      ],
      error: null,
    });
    const createMemory = vi.fn();

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory }}
      />,
    );

    await screen.findByText(/Khan Family Home/i);

    fireEvent.click(screen.getByRole("button", { name: /Home/i }));

    await waitFor(() => {
      expect(listMemories).toHaveBeenLastCalledWith("user-123", { layer: "HOME" });
    });
  });

  it("submits a new record and refreshes the list", async () => {
    const listMemories = vi
      .fn()
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({
        data: [
          {
            id: "1",
            title: "Grandfather Burial Plot",
            description: "Section B",
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
            createdAt: "2026-03-17T10:00:00.000Z",
            updatedAt: "2026-03-17T10:00:00.000Z",
          },
        ],
        error: null,
      });
    const createMemory = vi.fn().mockResolvedValue({
      data: {
        id: "1",
        title: "Grandfather Burial Plot",
      },
      error: null,
    });

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory }}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Grandfather Burial Plot" },
    });
    fireEvent.change(screen.getByLabelText(/Person Label/i), {
      target: { value: "Yusuf Khan" },
    });
    fireEvent.change(screen.getByLabelText(/Latitude/i), {
      target: { value: "25.2048" },
    });
    fireEvent.change(screen.getByLabelText(/Longitude/i), {
      target: { value: "55.2708" },
    });
    fireEvent.change(screen.getByLabelText(/Source Name/i), {
      target: { value: "Family record" },
    });
    fireEvent.change(screen.getByLabelText(/Source Notes/i), {
      target: { value: "Verified by family" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save Draft Memory/i }));

    await waitFor(() => {
      expect(createMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Grandfather Burial Plot",
          userId: "user-123",
        }),
      );
    });
    await screen.findByText(/Grandfather Burial Plot/i);
  });
});
