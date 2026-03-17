import type {
  CreateFamilyPersonInput,
  CreateRelationshipInput,
  FamilyAtlasPayload,
  FamilyPerson,
  FamilyRelationship,
  RelationshipType,
} from "./types";

export type FamilyAtlasDeps = {
  isConfigured: boolean;
  getUserIdForToken: (token: string) => Promise<{ userId: string | null; error: string | null }>;
  repository: {
    listPeopleByUser: (userId: string) => Promise<{ data: FamilyPerson[]; error: string | null }>;
    listRelationships: () => Promise<{ data: FamilyRelationship[]; error: string | null }>;
    createPerson: (
      userId: string,
      input: CreateFamilyPersonInput,
    ) => Promise<{ data: FamilyPerson | null; error: string | null }>;
    createRelationship: (
      input: CreateRelationshipInput,
    ) => Promise<{ data: FamilyRelationship | null; error: string | null }>;
  };
};

type FamilyAtlasResponse = {
  status: number;
  body: Record<string, unknown>;
};

export async function getFamilyAtlasForRequest(
  request: { authorizationHeader?: string | null },
  deps: FamilyAtlasDeps,
): Promise<FamilyAtlasResponse> {
  const auth = await authenticate(request.authorizationHeader, deps);
  if (auth.error) {
    return {
      status: auth.status,
      body: { data: { people: [], relationships: [] }, error: auth.error },
    };
  }

  const peopleResult = await deps.repository.listPeopleByUser(auth.userId);
  const relationshipResult = await deps.repository.listRelationships();

  if (peopleResult.error || relationshipResult.error) {
    return {
      status: 500,
      body: {
        data: { people: [], relationships: [] },
        error: peopleResult.error ?? relationshipResult.error,
      },
    };
  }

  const ownedIds = new Set(peopleResult.data.map((person) => person.id));
  const relationships = relationshipResult.data.filter(
    (relationship) => ownedIds.has(relationship.personId) && ownedIds.has(relationship.relatedPersonId),
  );

  return {
    status: 200,
    body: {
      data: {
        people: peopleResult.data,
        relationships,
      } satisfies FamilyAtlasPayload,
      error: null,
    },
  };
}

export async function createFamilyPersonForRequest(
  request: {
    authorizationHeader?: string | null;
    body: Partial<CreateFamilyPersonInput> | null;
  },
  deps: FamilyAtlasDeps,
): Promise<FamilyAtlasResponse> {
  const auth = await authenticate(request.authorizationHeader, deps);
  if (auth.error) {
    return {
      status: auth.status,
      body: { data: null, error: auth.error },
    };
  }

  const body = request.body ?? {};
  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    return {
      status: 400,
      body: { data: null, error: "First name and last name are required." },
    };
  }

  const result = await deps.repository.createPerson(auth.userId, {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    birthDate: body.birthDate?.trim() || undefined,
    deathDate: body.deathDate?.trim() || undefined,
    bio: body.bio?.trim() || undefined,
  });

  return {
    status: result.error ? 500 : 201,
    body: result,
  };
}

export async function createRelationshipForRequest(
  request: {
    authorizationHeader?: string | null;
    body: Partial<CreateRelationshipInput> | null;
  },
  deps: FamilyAtlasDeps,
): Promise<FamilyAtlasResponse> {
  const auth = await authenticate(request.authorizationHeader, deps);
  if (auth.error) {
    return {
      status: auth.status,
      body: { data: null, error: auth.error },
    };
  }

  const body = request.body ?? {};
  const type = coerceRelationshipType(body.type);
  if (!body.personId || !body.relatedPersonId || !type) {
    return {
      status: 400,
      body: { data: null, error: "Two people and a valid relationship type are required." },
    };
  }

  const atlas = await getFamilyAtlasForRequest(
    { authorizationHeader: request.authorizationHeader },
    deps,
  );
  const payload = atlas.body.data as FamilyAtlasPayload;
  const ownedIds = new Set(payload.people.map((person) => person.id));

  if (!ownedIds.has(body.personId) || !ownedIds.has(body.relatedPersonId)) {
    return {
      status: 403,
      body: { data: null, error: "Relationships can only connect your own family members." },
    };
  }

  const result = await deps.repository.createRelationship({
    personId: body.personId,
    relatedPersonId: body.relatedPersonId,
    type,
  });

  return {
    status: result.error ? 500 : 201,
    body: result,
  };
}

async function authenticate(
  authorizationHeader: string | null | undefined,
  deps: FamilyAtlasDeps,
) {
  if (!deps.isConfigured) {
    return {
      status: 503,
      userId: "",
      error: "Supabase server configuration is missing.",
    };
  }

  const token = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    return {
      status: 401,
      userId: "",
      error: "Authorization token is required.",
    };
  }

  const result = await deps.getUserIdForToken(token);

  if (!result.userId || result.error) {
    return {
      status: 401,
      userId: "",
      error: result.error ?? "Unable to verify the user session.",
    };
  }

  return {
    status: 200,
    userId: result.userId,
    error: null,
  };
}

function coerceRelationshipType(type: unknown): RelationshipType | undefined {
  if (
    type === "PARENT" ||
    type === "CHILD" ||
    type === "SPOUSE" ||
    type === "SIBLING" ||
    type === "GRANDPARENT" ||
    type === "GRANDCHILD"
  ) {
    return type;
  }

  return undefined;
}
