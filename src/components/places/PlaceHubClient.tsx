"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { ArrowLeft, Building2, Layers3, MapPinned, Users } from "lucide-react";
import { MemoryMap } from "@/components/memories/MemoryMap";
import { memoryClientApi } from "@/features/memories/client";
import type { MemoryListFilters, MemoryRecord } from "@/features/memories/types";
import { buildPartnerCollections } from "@/features/partner-dashboard/analytics";
import { buildPlaceHubs, getPlaceHubBySlug } from "@/features/place-hubs/utils";
import { useAuth } from "@/context/AuthContext";

export function PlaceHubClient({
  slug,
  memoryApi = memoryClientApi,
}: {
  slug: string;
  memoryApi?: {
    listMemories: (
      userId: string,
      options?: MemoryListFilters,
    ) => Promise<{ data: MemoryRecord[]; error: string | null }>;
  };
}) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!user) {
        setMemories([]);
        setLoading(false);
        return;
      }

      const result = await memoryApi.listMemories(user.id);

      if (!active) {
        return;
      }

      setMemories(result.data);
      setLoadError(result.error);
      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [memoryApi, user]);

  const hubs = useMemo(() => buildPlaceHubs(memories), [memories]);
  const hub = useMemo(() => getPlaceHubBySlug(memories, slug), [memories, slug]);
  const resolvedSelectedMemoryId =
    hub?.memories.some((memory) => memory.id === selectedMemoryId)
      ? selectedMemoryId
      : hub?.memories[0]?.id ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10">
          Loading canonical place hub...
        </div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="min-h-screen bg-background px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to atlas
          </Link>
          <h1 className="mt-6 text-3xl font-semibold">Place hub not found</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
            {user
              ? "This canonical place page does not exist in your current atlas data yet."
              : "Sign in and add memories with a place name to generate canonical place hubs from stored records."}
          </p>
        </div>
      </div>
    );
  }

  const relatedCollections = buildPartnerCollections(hub.memories);
  const relatedPlaces = hubs.filter((entry) => entry.slug !== hub.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to atlas
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
                Canonical Place Hub
              </div>
              <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">{hub.placeName}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/62">{hub.summary}</p>
              {loadError ? (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {loadError}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PlaceStat label="Records" value={String(hub.totalRecords)} icon={MapPinned} />
              <PlaceStat label="People" value={String(hub.peopleCount)} icon={Users} />
              <PlaceStat label="Layers" value={String(hub.layers.length)} icon={Layers3} />
              <PlaceStat label="Collections" value={String(relatedCollections.length)} icon={Building2} />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
              Place Context
            </div>
            <h2 className="mt-2 text-2xl font-semibold">Mapped memories around {hub.placeName}</h2>
          </div>
          <MemoryMap
            memories={hub.memories}
            selectedMemoryId={resolvedSelectedMemoryId}
            onSelectMemory={setSelectedMemoryId}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
              Memory Ledger
            </div>
            <div className="mt-4 space-y-3">
              {hub.memories.map((memory) => (
                <article
                  key={memory.id}
                  className={`rounded-[1.25rem] border p-4 transition ${
                    resolvedSelectedMemoryId === memory.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedMemoryId(memory.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                          {memory.layer} · {memory.status}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">{memory.title}</div>
                      </div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                        {memory.personName || "Shared memory"}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                      {memory.sourceNotes || memory.description || "No additional context yet."}
                    </p>
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
                Partner Collections
              </div>
              <div className="mt-4 space-y-3">
                {relatedCollections.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                    No partner collections are attached to this place hub yet.
                  </div>
                ) : (
                  relatedCollections.map((collection) => (
                    <article key={collection.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-white/45">{collection.sector}</div>
                      <div className="mt-2 text-lg font-semibold text-white">{collection.title}</div>
                      <p className="mt-3 text-sm text-white/60">
                        {collection.totalRecords} records, {collection.publishedRecords} published, {collection.reviewRecords} in review.
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
                Related Places
              </div>
              <div className="mt-4 space-y-3">
                {relatedPlaces.map((place) => (
                  <Link
                    key={place.slug}
                    href={`/places/${place.slug}`}
                    className="block rounded-[1.25rem] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <div className="text-lg font-semibold text-white">{place.placeName}</div>
                    <p className="mt-2 text-sm text-white/60">{place.totalRecords} memories in this hub.</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlaceStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div className="flex items-center gap-2 text-sm text-white/60">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}
