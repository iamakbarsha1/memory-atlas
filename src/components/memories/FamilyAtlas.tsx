"use client";

import { useEffect, useMemo, useState } from "react";
import { GitBranch, House, Plus, Users2 } from "lucide-react";
import { familyAtlasClientApi } from "@/features/family-atlas/client";
import {
  relationshipTypeValues,
  type CreateFamilyPersonInput,
  type CreateRelationshipInput,
  type FamilyAtlasPayload,
  type FamilyPerson,
} from "@/features/family-atlas/types";
import type { MemoryRecord } from "@/features/memories/types";

const initialPersonForm: CreateFamilyPersonInput = {
  firstName: "",
  lastName: "",
  birthDate: "",
  deathDate: "",
  bio: "",
};

const initialRelationshipForm: CreateRelationshipInput = {
  personId: "",
  relatedPersonId: "",
  type: "PARENT",
};

export function FamilyAtlas({
  memories,
  atlasApi = familyAtlasClientApi,
}: {
  memories: MemoryRecord[];
  atlasApi?: {
    loadAtlas: () => Promise<{ data: FamilyAtlasPayload; error: string | null }>;
    createPerson: (
      input: CreateFamilyPersonInput,
    ) => Promise<{ data: FamilyPerson | null; error: string | null }>;
    createRelationship: (
      input: CreateRelationshipInput,
    ) => Promise<{ data: FamilyAtlasPayload["relationships"][number] | null; error: string | null }>;
  };
}) {
  const [atlas, setAtlas] = useState<FamilyAtlasPayload>({ people: [], relationships: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personForm, setPersonForm] = useState(initialPersonForm);
  const [relationshipForm, setRelationshipForm] = useState(initialRelationshipForm);

  useEffect(() => {
    let isActive = true;

    async function load() {
      const result = await atlasApi.loadAtlas();
      if (!isActive) {
        return;
      }

      setAtlas(result.data);
      setError(result.error);
      setLoading(false);
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [atlasApi]);

  const familyFootprint = useMemo(() => {
    const names = new Set(atlas.people.map((person) => person.fullName));
    const familyMemories = memories.filter((memory) => memory.personName && names.has(memory.personName));

    return {
      totalMemories: familyMemories.length,
      byLayer: {
        BURIAL: familyMemories.filter((memory) => memory.layer === "BURIAL").length,
        HOME: familyMemories.filter((memory) => memory.layer === "HOME").length,
        EDUCATION: familyMemories.filter((memory) => memory.layer === "EDUCATION").length,
        HISTORY: familyMemories.filter((memory) => memory.layer === "HISTORY").length,
      },
      people: atlas.people.map((person) => ({
        person,
        memories: familyMemories.filter((memory) => memory.personName === person.fullName),
      })),
    };
  }, [atlas.people, memories]);

  const effectiveRelationshipPersonId = relationshipForm.personId || atlas.people[0]?.id || "";
  const effectiveRelatedPersonId =
    relationshipForm.relatedPersonId || atlas.people[1]?.id || atlas.people[0]?.id || "";

  async function handleAddPerson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await atlasApi.createPerson(personForm);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      const person = result.data;
      setAtlas((current) => ({
        ...current,
        people: [...current.people, person],
      }));
      setPersonForm(initialPersonForm);
      setError(null);
    }
  }

  async function handleAddRelationship(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await atlasApi.createRelationship({
      ...relationshipForm,
      personId: effectiveRelationshipPersonId,
      relatedPersonId: effectiveRelatedPersonId,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      const relationship = result.data;
      setAtlas((current) => ({
        ...current,
        relationships: [...current.relationships, relationship],
      }));
      setError(null);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
            Family Atlas
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Connect people across generations</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/58">
            Build a family graph, then use the current memory records to browse the shared footprint across homes, schools, burials, and historical moments.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
          {familyFootprint.totalMemories} family-linked memories in the current filtered view
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-[1.25rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <form className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5" onSubmit={handleAddPerson}>
            <div className="flex items-center gap-3 text-white">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Add family member</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <AtlasField label="First Name">
                <input
                  aria-label="Family first name"
                  value={personForm.firstName}
                  onChange={(event) => setPersonForm((current) => ({ ...current, firstName: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </AtlasField>
              <AtlasField label="Last Name">
                <input
                  aria-label="Family last name"
                  value={personForm.lastName}
                  onChange={(event) => setPersonForm((current) => ({ ...current, lastName: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </AtlasField>
              <AtlasField label="Birth Date">
                <input
                  aria-label="Family birth date"
                  type="date"
                  value={personForm.birthDate}
                  onChange={(event) => setPersonForm((current) => ({ ...current, birthDate: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </AtlasField>
              <AtlasField label="Death Date">
                <input
                  aria-label="Family death date"
                  type="date"
                  value={personForm.deathDate}
                  onChange={(event) => setPersonForm((current) => ({ ...current, deathDate: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </AtlasField>
              <AtlasField label="Bio" className="md:col-span-2">
                <textarea
                  aria-label="Family bio"
                  value={personForm.bio}
                  onChange={(event) => setPersonForm((current) => ({ ...current, bio: event.target.value }))}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </AtlasField>
            </div>
            <button
              type="submit"
              className="mt-4 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Add Family Member
            </button>
          </form>

          <form
            className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
            onSubmit={handleAddRelationship}
          >
            <div className="flex items-center gap-3 text-white">
              <GitBranch className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Connect relatives</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <AtlasField label="Person">
                <select
                  aria-label="Relationship person"
                  value={effectiveRelationshipPersonId}
                  onChange={(event) =>
                    setRelationshipForm((current) => ({ ...current, personId: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
                >
                  {atlas.people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName}
                    </option>
                  ))}
                </select>
              </AtlasField>
              <AtlasField label="Relationship">
                <select
                  aria-label="Relationship type"
                  value={relationshipForm.type}
                  onChange={(event) =>
                    setRelationshipForm((current) => ({
                      ...current,
                      type: event.target.value as CreateRelationshipInput["type"],
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
                >
                  {relationshipTypeValues.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </AtlasField>
              <AtlasField label="Related Person">
                <select
                  aria-label="Related person"
                  value={effectiveRelatedPersonId}
                  onChange={(event) =>
                    setRelationshipForm((current) => ({ ...current, relatedPersonId: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
                >
                  {atlas.people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName}
                    </option>
                  ))}
                </select>
              </AtlasField>
            </div>
            <button
              type="submit"
              disabled={atlas.people.length < 2}
              className="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Link Family Members
            </button>
          </form>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <Users2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Family graph</span>
            </div>
            {loading ? (
              <p className="mt-4 text-sm text-white/55">Loading family atlas...</p>
            ) : atlas.people.length === 0 ? (
              <p className="mt-4 text-sm text-white/55">Add family members to start building the atlas.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {atlas.people.map((person) => (
                  <div key={person.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <div className="text-base font-semibold text-white">{person.fullName}</div>
                    <div className="mt-2 text-sm text-white/55">
                      {atlas.relationships
                        .filter(
                          (relationship) =>
                            relationship.personId === person.id || relationship.relatedPersonId === person.id,
                        )
                        .map((relationship) => {
                          const counterpart = atlas.people.find((entry) =>
                            relationship.personId === person.id
                              ? entry.id === relationship.relatedPersonId
                              : entry.id === relationship.personId,
                          );

                          return counterpart ? `${relationship.type} ${counterpart.fullName}` : null;
                        })
                        .filter(Boolean)
                        .join(" • ") || "No linked relatives yet"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <House className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Shared family footprint</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(familyFootprint.byLayer).map(([layer, count]) => (
                <div key={layer} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">{layer}</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{count}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {familyFootprint.people.map(({ person, memories: personMemories }) => (
                <div key={person.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-white">{person.fullName}</div>
                    <div className="text-sm text-white/50">{personMemories.length} mapped memories</div>
                  </div>
                  <div className="mt-2 text-sm text-white/55">
                    {personMemories.map((memory) => memory.title).join(" • ") || "No linked memories yet"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AtlasField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
        {label}
      </span>
      {children}
    </label>
  );
}
