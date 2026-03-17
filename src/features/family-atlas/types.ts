export const relationshipTypeValues = [
  "PARENT",
  "CHILD",
  "SPOUSE",
  "SIBLING",
  "GRANDPARENT",
  "GRANDCHILD",
] as const;

export type RelationshipType = (typeof relationshipTypeValues)[number];

export type FamilyPerson = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  bio: string | null;
  userId: string | null;
  createdAt: string;
};

export type FamilyRelationship = {
  id: string;
  personId: string;
  relatedPersonId: string;
  type: RelationshipType;
  createdAt: string;
};

export type FamilyAtlasPayload = {
  people: FamilyPerson[];
  relationships: FamilyRelationship[];
};

export type CreateFamilyPersonInput = {
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  bio?: string;
};

export type CreateRelationshipInput = {
  personId: string;
  relatedPersonId: string;
  type: RelationshipType;
};
