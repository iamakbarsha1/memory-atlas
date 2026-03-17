"use client";

import { Clock3, Route, UserRound } from "lucide-react";
import type { MemoryRecord } from "@/features/memories/types";

export function MemoryTimeline({
  memories,
  selectedPerson,
  selectedMemoryId,
  onSelectPerson,
  onSelectMemory,
}: {
  memories: MemoryRecord[];
  selectedPerson: string | null;
  selectedMemoryId: string | null;
  onSelectPerson: (personName: string) => void;
  onSelectMemory: (memoryId: string) => void;
}) {
  const people = Array.from(
    new Set(
      memories
        .map((memory) => memory.personName?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((left, right) => left.localeCompare(right));

  if (people.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3 text-white">
          <UserRound className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Person Timeline</h3>
        </div>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
          Add person names to memories to build a life timeline and connect moments across places.
        </p>
      </section>
    );
  }

  const activePerson = people.includes(selectedPerson ?? "") ? (selectedPerson ?? people[0]) : people[0];
  const timelineMemories = memories
    .filter((memory) => memory.personName === activePerson)
    .sort((left, right) => compareMemoryDates(left, right));

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
            Person Timeline
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Follow one life across the map</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/58">
            Select a person and read their memories in chronological order while using the map to see where each stage happened.
          </p>
        </div>

        <label className="block min-w-56">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            Timeline Person
          </span>
          <select
            aria-label="Timeline person"
            value={activePerson}
            onChange={(event) => onSelectPerson(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
          >
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-3 text-white">
            <Route className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {timelineMemories.length} recorded {timelineMemories.length === 1 ? "moment" : "moments"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {timelineMemories.map((memory, index) => {
              const isActive = selectedMemoryId === memory.id;

              return (
                <button
                  key={memory.id}
                  type="button"
                  aria-label={`Open timeline memory ${memory.title}`}
                  onClick={() => onSelectMemory(memory.id)}
                  className={`flex w-full items-start gap-4 rounded-[1.25rem] border p-4 text-left transition ${
                    isActive
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="flex min-w-10 flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {index < timelineMemories.length - 1 ? (
                      <span className="mt-2 h-10 w-px bg-white/12" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                      <span>{memory.layer}</span>
                      <span>{formatTimelineDate(memory.dateOccurred)}</span>
                    </div>
                    <div className="mt-2 text-base font-semibold text-white">{memory.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {memory.description || "No description yet."}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-3 text-white">
            <Clock3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Life journey summary</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <StatCard label="Timeline Start" value={formatTimelineDate(timelineMemories[0]?.dateOccurred ?? null)} />
            <StatCard
              label="Timeline End"
              value={formatTimelineDate(timelineMemories[timelineMemories.length - 1]?.dateOccurred ?? null)}
            />
            <StatCard
              label="Layers Covered"
              value={String(new Set(timelineMemories.map((memory) => memory.layer)).size)}
            />
            <StatCard
              label="Mapped Places"
              value={String(
                new Set(
                  timelineMemories.map((memory) => `${memory.latitude.toFixed(3)}:${memory.longitude.toFixed(3)}`),
                ).size,
              )}
            />
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              Journey Narrative
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {buildJourneyNarrative(activePerson, timelineMemories)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function compareMemoryDates(left: MemoryRecord, right: MemoryRecord) {
  const leftTime = left.dateOccurred ? Date.parse(left.dateOccurred) : Number.POSITIVE_INFINITY;
  const rightTime = right.dateOccurred ? Date.parse(right.dateOccurred) : Number.POSITIVE_INFINITY;

  if (leftTime === rightTime) {
    return left.createdAt.localeCompare(right.createdAt);
  }

  return leftTime - rightTime;
}

function formatTimelineDate(value: string | null) {
  if (!value) {
    return "Undated";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function buildJourneyNarrative(personName: string, memories: MemoryRecord[]) {
  if (memories.length === 0) {
    return `${personName} does not have any dated memories in the current filtered view yet.`;
  }

  const first = memories[0];
  const last = memories[memories.length - 1];

  return `${personName} currently has ${memories.length} mapped memories in this filtered view, beginning with ${first.title} and extending through ${last.title}. Use the timeline to step through each moment and watch the map shift with the story.`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
