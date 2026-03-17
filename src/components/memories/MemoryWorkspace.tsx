"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe2, MapPinned, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoryMap } from "@/components/memories/MemoryMap";
import { memoryClientApi } from "@/features/memories/client";
import {
  memoryLayerValues,
  memorySourceTypeValues,
  memoryStatusValues,
  memoryTypeValues,
  memoryVisibilityValues,
  type CreateMemoryInput,
  type MemoryLayer,
  type MemoryListFilters,
  type MemoryRecord,
  type UpdateMemoryInput,
} from "@/features/memories/types";

type MemoryWorkspaceProps = {
  userId: string;
  userName?: string | null;
  memoryApi?: {
    listMemories: (
      userId: string,
      options?: MemoryListFilters,
    ) => Promise<{ data: MemoryRecord[]; error: string | null }>;
    createMemory: (
      input: CreateMemoryInput,
    ) => Promise<{ data: MemoryRecord | null; error: string | null; validationErrors?: Record<string, string> }>;
    updateMemory: (
      input: UpdateMemoryInput,
    ) => Promise<{ data: MemoryRecord | null; error: string | null; validationErrors?: Record<string, string> }>;
    deleteMemory: (memoryId: string) => Promise<{ error: string | null }>;
  };
};

const layerLabels: Record<MemoryLayer, string> = {
  BURIAL: "Burial",
  HOME: "Home",
  EDUCATION: "Education",
  HISTORY: "History",
};

const initialFormState: Omit<CreateMemoryInput, "userId"> = {
  title: "",
  description: "",
  layer: "BURIAL",
  type: "BURIAL",
  latitude: 0,
  longitude: 0,
  dateOccurred: "",
  personName: "",
  visibility: "PRIVATE",
  status: "DRAFT",
  sourceType: "FAMILY",
  sourceName: "",
  sourceUrl: "",
  sourceNotes: "",
};

export function MemoryWorkspace({
  userId,
  userName,
  memoryApi = memoryClientApi,
}: MemoryWorkspaceProps) {
  const [selectedLayer, setSelectedLayer] = useState<MemoryLayer | "ALL">("ALL");
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [browseFilters, setBrowseFilters] = useState<{
    query: string;
    status: "ALL" | (typeof memoryStatusValues)[number];
    dateFrom: string;
    dateTo: string;
  }>({
    query: "",
    status: "ALL",
    dateFrom: "",
    dateTo: "",
  });

  const activeListFilters = useMemo<MemoryListFilters>(() => {
    return {
      layer: selectedLayer === "ALL" ? undefined : selectedLayer,
      status: browseFilters.status === "ALL" ? undefined : browseFilters.status,
      query: browseFilters.query.trim() || undefined,
      dateFrom: browseFilters.dateFrom || undefined,
      dateTo: browseFilters.dateTo || undefined,
    };
  }, [browseFilters, selectedLayer]);

  async function refreshMemories() {
    setLoading(true);
    setLoadError(null);

    const result = await memoryApi.listMemories(userId, activeListFilters);

    setMemories(result.data ?? []);
    setLoadError(result.error);
    setSelectedMemoryId((current) => {
      if (!result.data?.length) {
        return null;
      }

      return result.data.some((memory) => memory.id === current) ? current : result.data[0].id;
    });
    setLoading(false);
  }

  useEffect(() => {
    let isActive = true;

    async function load() {
      const result = await memoryApi.listMemories(userId, activeListFilters);

      if (!isActive) {
        return;
      }

      setMemories(result.data ?? []);
      setLoadError(result.error);
      setSelectedMemoryId((current) => {
        if (!result.data?.length) {
          return null;
        }

        return result.data.some((memory) => memory.id === current) ? current : result.data[0].id;
      });
      setLoading(false);
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [activeListFilters, memoryApi, userId]);

  const layerSummary = useMemo(() => {
    return memoryLayerValues.map((layer) => ({
      layer,
      count: memories.filter((memory) => memory.layer === layer).length,
    }));
  }, [memories]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const result = editingId
      ? await memoryApi.updateMemory({
          id: editingId,
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          userId,
        })
      : await memoryApi.createMemory({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          userId,
        });

    if (result.error) {
      setSubmitError(result.error);
      setFieldErrors((result.validationErrors as Record<string, string>) ?? {});
      setSaving(false);
      return;
    }

    setFieldErrors({});
    setSubmitSuccess(editingId ? "Memory updated." : "Draft memory saved.");
    setForm({
      ...initialFormState,
      layer: form.layer,
      type: form.type,
      visibility: form.visibility,
      status: form.status,
      sourceType: form.sourceType,
    });
    setEditingId(null);
    await refreshMemories();
    setSaving(false);
  }

  function handleEdit(memory: MemoryRecord) {
    setEditingId(memory.id);
    setSelectedMemoryId(memory.id);
    setSubmitError(null);
    setSubmitSuccess(null);
    setFieldErrors({});
    setForm({
      title: memory.title,
      description: memory.description ?? "",
      layer: memory.layer,
      type: memory.type,
      latitude: memory.latitude,
      longitude: memory.longitude,
      dateOccurred: memory.dateOccurred ? memory.dateOccurred.slice(0, 10) : "",
      personName: memory.personName ?? "",
      visibility: memory.visibility,
      status: memory.status,
      sourceType: memory.sourceType,
      sourceName: memory.sourceName,
      sourceUrl: memory.sourceUrl ?? "",
      sourceNotes: memory.sourceNotes ?? "",
    });
  }

  async function handleDelete(memoryId: string) {
    setSubmitError(null);
    setSubmitSuccess(null);

    const result = await memoryApi.deleteMemory(memoryId);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    if (editingId === memoryId) {
      setEditingId(null);
      setForm(initialFormState);
    }

    setSubmitSuccess("Memory deleted.");
    await refreshMemories();
  }

  function handleCancelEdit() {
    setEditingId(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    setFieldErrors({});
    setForm(initialFormState);
  }

  function handleLayerSelect(layer: MemoryLayer | "ALL") {
    setLoading(true);
    setLoadError(null);
    setSelectedLayer(layer);
  }

  function handleBrowseFilterChange<K extends keyof typeof browseFilters>(
    key: K,
    value: (typeof browseFilters)[K],
  ) {
    setLoading(true);
    setLoadError(null);
    setBrowseFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleFieldChange<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
              Atlas Workspace
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {editingId ? "Edit memory record" : "Build your first memory layer"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              Signed in as {userName || "memory archivist"}. This Phase 1 workspace stores
              structured records with source, visibility, status, and layer metadata.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm text-white/70">
            <div className="font-semibold text-white">{memories.length}</div>
            <div>records loaded</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 md:grid-cols-4">
          <Field label="Search">
            <input
              aria-label="Search memories"
              value={browseFilters.query}
              onChange={(event) => handleBrowseFilterChange("query", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary"
              placeholder="Person, place, source"
            />
          </Field>

          <Field label="Status">
            <select
              aria-label="Browse status"
              value={browseFilters.status}
              onChange={(event) =>
                handleBrowseFilterChange(
                  "status",
                  event.target.value as "ALL" | (typeof memoryStatusValues)[number],
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
            >
              <option value="ALL">All statuses</option>
              {memoryStatusValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date From">
            <input
              aria-label="Date From Filter"
              type="date"
              value={browseFilters.dateFrom}
              onChange={(event) => handleBrowseFilterChange("dateFrom", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary"
            />
          </Field>

          <Field label="Date To">
            <input
              aria-label="Date To Filter"
              type="date"
              value={browseFilters.dateTo}
              onChange={(event) => handleBrowseFilterChange("dateTo", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-primary"
            />
          </Field>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Title" error={fieldErrors.title}>
            <input
              aria-label="Title"
              value={form.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
              placeholder="Grandfather burial plot"
            />
          </Field>

          <Field label="Person Label">
            <input
              aria-label="Person Label"
              value={form.personName}
              onChange={(event) => handleFieldChange("personName", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
              placeholder="Yusuf Khan"
            />
          </Field>

          <Field label="Layer">
            <select
              aria-label="Layer"
              value={form.layer}
              onChange={(event) => handleFieldChange("layer", event.target.value as MemoryLayer)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
            >
              {memoryLayerValues.map((layer) => (
                <option key={layer} value={layer}>
                  {layerLabels[layer]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Type">
            <select
              aria-label="Type"
              value={form.type}
              onChange={(event) => handleFieldChange("type", event.target.value as CreateMemoryInput["type"])}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
            >
              {memoryTypeValues.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Latitude" error={fieldErrors.latitude}>
            <input
              aria-label="Latitude"
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(event) => handleFieldChange("latitude", Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
            />
          </Field>

          <Field label="Longitude" error={fieldErrors.longitude}>
            <input
              aria-label="Longitude"
              type="number"
              step="0.0001"
              value={form.longitude}
              onChange={(event) => handleFieldChange("longitude", Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
            />
          </Field>

          <Field label="Visibility">
            <select
              aria-label="Visibility"
              value={form.visibility}
              onChange={(event) =>
                handleFieldChange("visibility", event.target.value as CreateMemoryInput["visibility"])
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
            >
              {memoryVisibilityValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              aria-label="Status"
              value={form.status}
              onChange={(event) =>
                handleFieldChange("status", event.target.value as CreateMemoryInput["status"])
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
            >
              {memoryStatusValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Source Type">
            <select
              aria-label="Source Type"
              value={form.sourceType}
              onChange={(event) =>
                handleFieldChange("sourceType", event.target.value as CreateMemoryInput["sourceType"])
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-primary"
            >
              {memorySourceTypeValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date Occurred">
            <input
              aria-label="Date Occurred"
              type="date"
              value={form.dateOccurred}
              onChange={(event) => handleFieldChange("dateOccurred", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
            />
          </Field>

          <Field label="Source Name" error={fieldErrors.sourceName}>
            <input
              aria-label="Source Name"
              value={form.sourceName}
              onChange={(event) => handleFieldChange("sourceName", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
              placeholder="Family record"
            />
          </Field>

          <Field label="Source URL" error={fieldErrors.sourceUrl}>
            <input
              aria-label="Source URL"
              value={form.sourceUrl}
              onChange={(event) => handleFieldChange("sourceUrl", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
              placeholder="https://archive.example.org"
            />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <textarea
              aria-label="Description"
              value={form.description}
              onChange={(event) => handleFieldChange("description", event.target.value)}
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
              placeholder="Context for why this place matters."
            />
          </Field>

          <Field label="Source Notes" className="md:col-span-2">
            <textarea
              aria-label="Source Notes"
              value={form.sourceNotes}
              onChange={(event) => handleFieldChange("sourceNotes", event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-primary"
              placeholder="Verification notes, archive references, or family context."
            />
          </Field>

          {(submitError || submitSuccess) && (
            <div
              className={`md:col-span-2 rounded-2xl border px-4 py-3 text-sm ${
                submitError
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              }`}
            >
              {submitError || submitSuccess}
            </div>
          )}

          <div className="md:col-span-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Records include moderation-ready status and visibility fields.
            </div>
            <div className="flex items-center gap-3">
              {editingId ? (
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Save Draft Memory"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
              Layer Explorer
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight">Map-ready records by layer</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={selectedLayer === "ALL"}
              label="All"
              onClick={() => handleLayerSelect("ALL")}
            />
            {memoryLayerValues.map((layer) => (
              <FilterButton
                key={layer}
                active={selectedLayer === layer}
                label={layerLabels[layer]}
                onClick={() => handleLayerSelect(layer)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
            <div className="p-4">
              <MemoryMap
                memories={memories}
                selectedMemoryId={selectedMemoryId}
                onSelectMemory={setSelectedMemoryId}
              />
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {layerSummary.map((item) => (
                <div key={item.layer} className="rounded-2xl bg-white/5 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.25em] text-white/45">
                    {layerLabels[item.layer]}
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-white">{item.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-8 text-sm text-white/60">
                Loading records...
              </div>
            ) : loadError ? (
              <div className="rounded-[1.5rem] border border-red-500/30 bg-red-500/10 px-5 py-8 text-sm text-red-200">
                {loadError}
              </div>
            ) : memories.length === 0 ? (
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-8 text-sm text-white/60">
                No records yet for this layer. Save one to seed the atlas.
              </div>
            ) : (
              memories.map((memory) => (
                <article
                  key={memory.id}
                  className={`rounded-[1.5rem] border p-5 transition ${
                    selectedMemoryId === memory.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-primary/75">
                        {layerLabels[memory.layer]} Layer
                      </div>
                      <h4 className="mt-2 text-lg font-semibold text-white">{memory.title}</h4>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {memory.status}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {memory.description || "No description yet."}
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-primary" />
                      {memory.latitude.toFixed(4)}, {memory.longitude.toFixed(4)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-primary" />
                      {memory.personName || "Unassigned person"}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                    <span className="rounded-full bg-white/5 px-3 py-1">{memory.visibility}</span>
                    <span className="rounded-full bg-white/5 px-3 py-1">{memory.sourceType}</span>
                    <span className="rounded-full bg-white/5 px-3 py-1">{memory.type}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMemoryId(memory.id)}
                    className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10"
                  >
                    Focus On Map
                  </button>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(memory)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10"
                      aria-label={`Edit ${memory.title}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(memory.id)}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
                      aria-label={`Delete ${memory.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
        {label}
      </span>
      {children}
      {error ? <span className="mt-2 block text-sm text-red-300">{error}</span> : null}
    </label>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? "bg-primary text-white" : "bg-white/5 text-white/65 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
