"use client";

import { MapPinned, Orbit, ScrollText } from "lucide-react";
import type { MemoryRecord } from "@/features/memories/types";

const layerStyles = {
  BURIAL: {
    dot: "bg-amber-400 shadow-[0_0_0_6px_rgba(245,158,11,0.18)]",
    label: "text-amber-200",
  },
  HOME: {
    dot: "bg-blue-400 shadow-[0_0_0_6px_rgba(59,130,246,0.18)]",
    label: "text-blue-200",
  },
  EDUCATION: {
    dot: "bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]",
    label: "text-emerald-200",
  },
  HISTORY: {
    dot: "bg-slate-200 shadow-[0_0_0_6px_rgba(255,255,255,0.12)]",
    label: "text-slate-200",
  },
} as const;

export function MemoryMap({
  memories,
  selectedMemoryId,
  onSelectMemory,
}: {
  memories: MemoryRecord[];
  selectedMemoryId: string | null;
  onSelectMemory: (memoryId: string) => void;
}) {
  const selectedMemory =
    memories.find((memory) => memory.id === selectedMemoryId) ?? memories[0] ?? null;

  if (memories.length === 0) {
    return (
      <div className="memory-map relative flex h-full min-h-80 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#020817] px-6 py-8">
        <div className="absolute inset-0 opacity-60" />
        <div className="relative z-10 max-w-sm text-center">
          <Orbit className="mx-auto h-10 w-10 text-primary/80" />
          <h4 className="mt-4 text-lg font-semibold text-white">No mapped records for this layer yet</h4>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            Save a memory with coordinates and it will appear here as an atlas marker.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="memory-map relative min-h-80 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#020817]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.2),rgba(2,6,23,0.94))]" />
        <div className="absolute inset-x-0 top-10 h-px bg-white/8" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-white/8" />
        <div className="absolute inset-x-0 bottom-1/3 h-px bg-white/8" />
        <div className="absolute inset-y-0 left-1/4 w-px bg-white/8" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/8" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-white/8" />

        <div className="absolute left-[11%] top-[28%] h-[27%] w-[17%] rounded-[48%_52%_47%_53%] bg-white/6 blur-[1px]" />
        <div className="absolute left-[28%] top-[18%] h-[33%] w-[15%] rounded-[56%_44%_58%_42%] bg-white/5 blur-[1px]" />
        <div className="absolute left-[47%] top-[24%] h-[24%] w-[11%] rounded-[48%_52%_42%_58%] bg-white/5 blur-[1px]" />
        <div className="absolute right-[17%] top-[22%] h-[30%] w-[18%] rounded-[45%_55%_52%_48%] bg-white/6 blur-[1px]" />
        <div className="absolute right-[11%] bottom-[18%] h-[18%] w-[14%] rounded-[58%_42%_48%_52%] bg-white/5 blur-[1px]" />

        <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/45 backdrop-blur">
          Layer Map
        </div>

        {memories.map((memory) => {
          const position = projectToMap(memory.latitude, memory.longitude);
          const styles = layerStyles[memory.layer];
          const isActive = selectedMemory?.id === memory.id;

          return (
            <button
              key={memory.id}
              type="button"
              aria-label={`View ${memory.title} on map`}
              onClick={() => onSelectMemory(memory.id)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border border-white/70 transition ${
                  styles.dot
                } ${isActive ? "scale-125" : "hover:scale-110"}`}
              />
              <span
                className={`mt-2 block rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-medium backdrop-blur transition ${
                  isActive ? "text-white" : "text-white/60"
                }`}
              >
                {memory.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        {selectedMemory ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className={`text-xs font-semibold uppercase tracking-[0.25em] ${layerStyles[selectedMemory.layer].label}`}>
                  {selectedMemory.layer} Layer
                </div>
                <h4 className="mt-2 text-2xl font-semibold text-white">{selectedMemory.title}</h4>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                {selectedMemory.status}
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/65">
              {selectedMemory.description || "No description yet."}
            </p>

            <div className="mt-5 space-y-3 text-sm text-white/72">
              <div className="flex items-center gap-3">
                <MapPinned className="h-4 w-4 text-primary" />
                <span>
                  {selectedMemory.latitude.toFixed(4)}, {selectedMemory.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Orbit className="h-4 w-4 text-primary" />
                <span>{selectedMemory.personName || "Unassigned person"}</span>
              </div>
              <div className="flex items-center gap-3">
                <ScrollText className="h-4 w-4 text-primary" />
                <span>{formatSourceLabel(selectedMemory)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full bg-white/6 px-3 py-1">{selectedMemory.visibility}</span>
              <span className="rounded-full bg-white/6 px-3 py-1">{selectedMemory.type}</span>
              <span className="rounded-full bg-white/6 px-3 py-1">{selectedMemory.sourceType}</span>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                Detail Notes
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {selectedMemory.sourceNotes || "No source notes yet for this memory."}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function projectToMap(latitude: number, longitude: number) {
  const x = ((longitude + 180) / 360) * 100;
  const y = ((90 - latitude) / 180) * 100;

  return {
    x: clamp(x, 6, 94),
    y: clamp(y, 10, 90),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatSourceLabel(memory: MemoryRecord) {
  if (memory.sourceName.toLowerCase() === "interview") {
    return "Oral history interview";
  }

  return memory.sourceName;
}
