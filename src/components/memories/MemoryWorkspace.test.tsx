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
    const updateMemory = vi.fn();
    const deleteMemory = vi.fn();

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory, updateMemory, deleteMemory }}
      />,
    );

    await screen.findByRole("button", { name: /Edit Khan Family Home/i });

    fireEvent.click(screen.getByRole("button", { name: /^Home$/i }));

    await waitFor(() => {
      expect(listMemories).toHaveBeenLastCalledWith("user-123", {
        layer: "HOME",
        status: undefined,
        query: undefined,
        dateFrom: undefined,
        dateTo: undefined,
      });
    });
  });

  it("passes search and browse filters to the list API", async () => {
    const listMemories = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const createMemory = vi.fn();
    const updateMemory = vi.fn();
    const deleteMemory = vi.fn();

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory, updateMemory, deleteMemory }}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Search memories/i), {
      target: { value: "amina" },
    });
    fireEvent.change(screen.getByLabelText(/Browse status/i), {
      target: { value: "DRAFT" },
    });
    fireEvent.change(screen.getByLabelText(/Date From Filter/i), {
      target: { value: "1990-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/Date To Filter/i), {
      target: { value: "1995-01-01" },
    });

    await waitFor(() => {
      expect(listMemories).toHaveBeenLastCalledWith("user-123", {
        layer: undefined,
        status: "DRAFT",
        query: "amina",
        dateFrom: "1990-01-01",
        dateTo: "1995-01-01",
      });
    });
  });

  it("shows a person timeline and lets the user switch people", async () => {
    const listMemories = vi.fn().mockResolvedValue({
      data: [
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
          createdAt: "2026-03-17T10:00:00.000Z",
          updatedAt: "2026-03-17T10:00:00.000Z",
        },
        {
          id: "2",
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
          createdAt: "2026-03-17T10:00:00.000Z",
          updatedAt: "2026-03-17T10:00:00.000Z",
        },
      ],
      error: null,
    });
    const createMemory = vi.fn();
    const updateMemory = vi.fn();
    const deleteMemory = vi.fn();

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory, updateMemory, deleteMemory }}
      />,
    );

    await screen.findByRole("combobox", { name: /Timeline person/i });

    fireEvent.change(screen.getByRole("combobox", { name: /Timeline person/i }), {
      target: { value: "Yusuf Khan" },
    });

    expect(screen.getByRole("button", { name: /Open timeline memory Burial Site/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Open timeline memory Burial Site/i }));

    expect(screen.getByRole("combobox", { name: /Timeline person/i })).toHaveValue("Yusuf Khan");
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
    const updateMemory = vi.fn();
    const deleteMemory = vi.fn();

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory, updateMemory, deleteMemory }}
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
    await screen.findByRole("button", { name: /Edit Grandfather Burial Plot/i });
  });

  it("loads a record into the form and saves edits", async () => {
    const memory = {
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
    };
    const listMemories = vi
      .fn()
      .mockResolvedValueOnce({ data: [memory], error: null })
      .mockResolvedValueOnce({
        data: [{ ...memory, title: "Updated Home Record" }],
        error: null,
      });
    const createMemory = vi.fn();
    const updateMemory = vi.fn().mockResolvedValue({
      data: { ...memory, title: "Updated Home Record" },
      error: null,
    });
    const deleteMemory = vi.fn();

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory, updateMemory, deleteMemory }}
      />,
    );

    await screen.findByRole("button", { name: /Edit Khan Family Home/i });
    fireEvent.click(screen.getByRole("button", { name: /Edit Khan Family Home/i }));

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Updated Home Record" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          title: "Updated Home Record",
          userId: "user-123",
        }),
      );
    });
  });

  it("deletes a record and refreshes the list", async () => {
    const memory = {
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
    };
    const listMemories = vi
      .fn()
      .mockResolvedValueOnce({ data: [memory], error: null })
      .mockResolvedValueOnce({ data: [], error: null });
    const createMemory = vi.fn();
    const updateMemory = vi.fn();
    const deleteMemory = vi.fn().mockResolvedValue({ error: null });

    render(
      <MemoryWorkspace
        userId="user-123"
        userName="Akbarsha"
        memoryApi={{ listMemories, createMemory, updateMemory, deleteMemory }}
      />,
    );

    await screen.findByRole("button", { name: /Delete Khan Family Home/i });
    fireEvent.click(screen.getByRole("button", { name: /Delete Khan Family Home/i }));

    await waitFor(() => {
      expect(deleteMemory).toHaveBeenCalledWith("1");
    });
  });
});
