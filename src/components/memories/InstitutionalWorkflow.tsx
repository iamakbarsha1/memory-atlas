"use client";

import { useMemo, useState } from "react";
import { Building2, Download, FileInput, ShieldCheck, UserCheck } from "lucide-react";
import { institutionalWorkflowClientApi } from "@/features/institutional-workflows/client";
import { buildInstitutionalExportCsv } from "@/features/institutional-workflows/csv";
import type { ModerationAuditEntry } from "@/features/institutional-workflows/types";
import type { MemoryRecord } from "@/features/memories/types";

export function InstitutionalWorkflow({
  memories,
  onRefreshMemories,
  workflowApi = institutionalWorkflowClientApi,
}: {
  memories: MemoryRecord[];
  onRefreshMemories: () => Promise<void>;
  workflowApi?: {
    assignReviewer: (input: {
      memoryId: string;
      reviewerAssignedTo: string;
      actorName?: string;
      institutionName?: string;
      note?: string;
    }) => Promise<{ data: { memoryId: string; auditEntry: ModerationAuditEntry | null } | null; error: string | null }>;
    reviewMemory: (input: {
      memoryId: string;
      action: "SEND_TO_REVIEW" | "PUBLISH" | "ARCHIVE";
      actorName: string;
      institutionName?: string;
      note: string;
    }) => Promise<{ data: { memoryId: string; auditEntry: ModerationAuditEntry | null } | null; error: string | null }>;
    importCsv: (input: {
      csvText: string;
      institutionName: string;
      actorName: string;
      reviewerAssignedTo?: string;
    }) => Promise<{
      data: { importedCount: number; batchId: string; auditEntries: ModerationAuditEntry[] } | null;
      error: string | null;
    }>;
  };
}) {
  const initialQueueMemory =
    memories.find((memory) => memory.status === "DRAFT" || memory.status === "REVIEW") ?? null;
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(initialQueueMemory?.id ?? null);
  const [institutionName, setInstitutionName] = useState(initialQueueMemory?.institutionName || "Archive Desk");
  const [reviewerAssignedTo, setReviewerAssignedTo] = useState(
    initialQueueMemory?.reviewerAssignedTo || "Lead Archivist",
  );
  const [actorName, setActorName] = useState("Archivist");
  const [decisionNote, setDecisionNote] = useState(
    initialQueueMemory?.moderationDecisionNote || "Ready for institutional review.",
  );
  const [csvText, setCsvText] = useState("");
  const [activity, setActivity] = useState<ModerationAuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const queue = useMemo(
    () => memories.filter((memory) => memory.status === "DRAFT" || memory.status === "REVIEW"),
    [memories],
  );
  const selectedMemory = queue.find((memory) => memory.id === selectedMemoryId) ?? queue[0] ?? null;
  const exportCsv = useMemo(() => buildInstitutionalExportCsv(memories), [memories]);

  async function handleAssignReviewer() {
    if (!selectedMemory) {
      return;
    }

    const result = await workflowApi.assignReviewer({
      memoryId: selectedMemory.id,
      reviewerAssignedTo,
      actorName,
      institutionName,
      note: decisionNote,
    });

    if (result.error) {
      setError(result.error);
      setSuccess(null);
      return;
    }

    const auditEntry = result.data?.auditEntry;
    if (auditEntry) {
      setActivity((current) => [auditEntry, ...current].slice(0, 8));
    }
    setError(null);
    setSuccess("Reviewer assignment saved.");
    await onRefreshMemories();
  }

  async function handleModeration(action: "SEND_TO_REVIEW" | "PUBLISH" | "ARCHIVE") {
    if (!selectedMemory) {
      return;
    }

    const result = await workflowApi.reviewMemory({
      memoryId: selectedMemory.id,
      action,
      actorName,
      institutionName,
      note: decisionNote,
    });

    if (result.error) {
      setError(result.error);
      setSuccess(null);
      return;
    }

    const auditEntry = result.data?.auditEntry;
    if (auditEntry) {
      setActivity((current) => [auditEntry, ...current].slice(0, 8));
    }
    setError(null);
    setSuccess(`Moderation action recorded: ${formatActionLabel(action)}.`);
    await onRefreshMemories();
  }

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await workflowApi.importCsv({
      csvText,
      institutionName,
      actorName,
      reviewerAssignedTo,
    });

    if (result.error) {
      setError(result.error);
      setSuccess(null);
      return;
    }

    setActivity((current) => [...(result.data?.auditEntries ?? []), ...current].slice(0, 8));
    setCsvText("");
    setError(null);
    setSuccess(`Imported ${result.data?.importedCount ?? 0} records into batch ${result.data?.batchId ?? ""}.`);
    await onRefreshMemories();
  }

  function handleSelectMemory(memory: MemoryRecord) {
    setSelectedMemoryId(memory.id);
    setInstitutionName(memory.institutionName || "Archive Desk");
    setReviewerAssignedTo(memory.reviewerAssignedTo || "Lead Archivist");
    setDecisionNote(memory.moderationDecisionNote || "Ready for institutional review.");
  }

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
            Institutional Workflow
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Moderation queue, reviewer assignment, and archive exchange
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/58">
            Give archivists and partner institutions a practical review desk: assign records, move them through moderation, and exchange place-memory data as CSV.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
          {queue.length} records currently in the moderation queue
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-[1.25rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-5 rounded-[1.25rem] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Moderation queue</span>
            </div>

            <div className="mt-4 space-y-3">
              {queue.length === 0 ? (
                <div className="rounded-2xl bg-white/5 px-4 py-4 text-sm text-white/60">
                  No draft or review records are waiting on institutional workflow right now.
                </div>
              ) : (
                queue.map((memory) => (
                  <button
                    key={memory.id}
                    type="button"
                    onClick={() => handleSelectMemory(memory)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      selectedMemory?.id === memory.id
                        ? "border-primary/40 bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{memory.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/45">
                          {memory.status} · {memory.layer}
                        </div>
                      </div>
                      <div className="text-right text-xs text-white/50">
                        {memory.reviewerAssignedTo || "Unassigned"}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <Download className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Export current atlas view</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/58">
              This export follows the current filtered memory dataset, so partner institutions can ingest the same moderated slice they are reviewing.
            </p>
            <textarea
              readOnly
              aria-label="Institutional export csv"
              value={exportCsv}
              className="mt-4 min-h-44 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-xs text-white/75 outline-none"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Reviewer assignment and moderation</span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <WorkflowField label="Institution">
                <input
                  aria-label="Institution name"
                  value={institutionName}
                  onChange={(event) => setInstitutionName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </WorkflowField>
              <WorkflowField label="Reviewer">
                <input
                  aria-label="Reviewer assigned to"
                  value={reviewerAssignedTo}
                  onChange={(event) => setReviewerAssignedTo(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </WorkflowField>
              <WorkflowField label="Actor">
                <input
                  aria-label="Workflow actor"
                  value={actorName}
                  onChange={(event) => setActorName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </WorkflowField>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                <div className="text-xs uppercase tracking-[0.25em] text-white/45">Selected record</div>
                <div className="mt-2 font-medium text-white">
                  {selectedMemory?.title || "No queue record selected"}
                </div>
              </div>
              <WorkflowField label="Decision Note" className="md:col-span-2">
                <textarea
                  aria-label="Moderation decision note"
                  value={decisionNote}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
                />
              </WorkflowField>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleAssignReviewer()}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Assign Reviewer
              </button>
              <button
                type="button"
                onClick={() => void handleModeration("SEND_TO_REVIEW")}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Send To Review
              </button>
              <button
                type="button"
                onClick={() => void handleModeration("PUBLISH")}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => void handleModeration("ARCHIVE")}
                className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200"
              >
                Archive
              </button>
            </div>
          </div>

          <form className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5" onSubmit={handleImport}>
            <div className="flex items-center gap-3 text-white">
              <FileInput className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Bulk import for archivists and partners</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/58">
              Paste CSV using the export schema to onboard cemetery, university, or museum place-memory collections into review state.
            </p>
            <textarea
              aria-label="Institutional import csv"
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              className="mt-4 min-h-44 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-xs text-white outline-none transition focus:border-primary"
              placeholder="title,description,layer,type,latitude,longitude,dateOccurred,personName,visibility,status,sourceType,sourceName,sourceUrl,sourceNotes,trustLabel,sensitivity,reviewNotes,respectfulHandlingNotes,hidePreciseLocation,institutionName,reviewerAssignedTo"
            />
            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              <Building2 className="h-4 w-4" />
              Import CSV Batch
            </button>
          </form>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-medium text-white">Recent workflow activity</div>
            <div className="mt-4 space-y-3">
              {activity.length === 0 ? (
                <div className="rounded-2xl bg-white/5 px-4 py-4 text-sm text-white/60">
                  No institutional actions recorded in this session yet.
                </div>
              ) : (
                activity.map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-white/5 px-4 py-4 text-sm text-white/70">
                    <div className="font-medium text-white">{formatActionLabel(entry.action)}</div>
                    <div className="mt-1">
                      {entry.actorName || "Unknown actor"}
                      {entry.reviewerAssignedTo ? ` -> ${entry.reviewerAssignedTo}` : ""}
                    </div>
                    {entry.note ? <div className="mt-1 text-white/55">{entry.note}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowField({
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

function formatActionLabel(action: string) {
  return action.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
}
