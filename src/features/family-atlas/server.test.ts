import { describe, expect, it, vi } from "vitest";
import {
  createFamilyPersonForRequest,
  createRelationshipForRequest,
  getFamilyAtlasForRequest,
  type FamilyAtlasDeps,
} from "./server";

function createDeps(): FamilyAtlasDeps {
  return {
    isConfigured: true,
    getUserIdForToken: vi.fn().mockResolvedValue({ userId: "user-123", error: null }),
    repository: {
      listPeopleByUser: vi.fn().mockResolvedValue({
        data: [
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
        error: null,
      }),
      listRelationships: vi.fn().mockResolvedValue({
        data: [
          {
            id: "relationship-1",
            personId: "person-1",
            relatedPersonId: "person-2",
            type: "CHILD",
            createdAt: "2026-03-18T00:00:00.000Z",
          },
        ],
        error: null,
      }),
      createPerson: vi.fn().mockResolvedValue({
        data: {
          id: "person-3",
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
      createRelationship: vi.fn().mockResolvedValue({
        data: {
          id: "relationship-2",
          personId: "person-1",
          relatedPersonId: "person-2",
          type: "CHILD",
          createdAt: "2026-03-18T00:00:00.000Z",
        },
        error: null,
      }),
    },
  };
}

describe("getFamilyAtlasForRequest", () => {
  it("returns owned people and relationships", async () => {
    const deps = createDeps();

    const result = await getFamilyAtlasForRequest(
      { authorizationHeader: "Bearer token-123" },
      deps,
    );

    expect(result.status).toBe(200);
    expect((result.body.data as { people: unknown[] }).people).toHaveLength(2);
  });
});

describe("createFamilyPersonForRequest", () => {
  it("creates a family member for the authenticated user", async () => {
    const deps = createDeps();

    const result = await createFamilyPersonForRequest(
      {
        authorizationHeader: "Bearer token-123",
        body: { firstName: "Fatima", lastName: "Khan" },
      },
      deps,
    );

    expect(deps.repository.createPerson).toHaveBeenCalledWith("user-123", {
      firstName: "Fatima",
      lastName: "Khan",
      birthDate: undefined,
      deathDate: undefined,
      bio: undefined,
    });
    expect(result.status).toBe(201);
  });
});

describe("createRelationshipForRequest", () => {
  it("creates a relationship between owned family members", async () => {
    const deps = createDeps();

    const result = await createRelationshipForRequest(
      {
        authorizationHeader: "Bearer token-123",
        body: { personId: "person-1", relatedPersonId: "person-2", type: "CHILD" },
      },
      deps,
    );

    expect(deps.repository.createRelationship).toHaveBeenCalledWith({
      personId: "person-1",
      relatedPersonId: "person-2",
      type: "CHILD",
    });
    expect(result.status).toBe(201);
  });
});
