"use client";

import { BarChart3, Building2, FileBarChart2, Landmark } from "lucide-react";
import {
  buildPartnerCollections,
  buildPartnerDashboardAnalytics,
  buildPartnerReportViews,
} from "@/features/partner-dashboard/analytics";
import type { MemoryRecord } from "@/features/memories/types";

export function PartnerDashboard({ memories }: { memories: MemoryRecord[] }) {
  const collections = buildPartnerCollections(memories);
  const analytics = buildPartnerDashboardAnalytics(memories);
  const reports = buildPartnerReportViews(memories);

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
            Partner Dashboard
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Curated collections and reporting for institutional partners
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/58">
            Read-only reporting views for museums, campuses, and cemetery operators built from the current atlas slice, moderation state, and institutional trust metadata.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
          {analytics.totalInstitutions} partner collections represented in the current filtered view
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStat label="Institutions" value={String(analytics.totalInstitutions)} helper="Named partner collections" />
        <DashboardStat label="Published" value={String(analytics.publishedRecords)} helper="Public-facing partner records" />
        <DashboardStat label="In Review" value={String(analytics.reviewQueueRecords)} helper="Awaiting moderation completion" />
        <DashboardStat label="Verified" value={String(analytics.verifiedRecords)} helper="Records with non-unverified trust labels" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-3 text-white">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Curated institutional collections</span>
          </div>
          <div className="mt-4 space-y-3">
            {collections.length === 0 ? (
              <div className="rounded-2xl bg-white/5 px-4 py-4 text-sm text-white/60">
                No institutional collections are visible in the current filtered memory view yet.
              </div>
            ) : (
              collections.map((collection) => (
                <article key={collection.id} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] text-primary/70">
                        {formatSectorLabel(collection.sector)}
                      </div>
                      <h4 className="mt-2 text-lg font-semibold text-white">{collection.title}</h4>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {collection.totalRecords} records
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-white/68 md:grid-cols-3">
                    <div>Published: {collection.publishedRecords}</div>
                    <div>In Review: {collection.reviewRecords}</div>
                    <div>Verified: {collection.verifiedRecords}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                    {collection.layers.map((layer) => (
                      <span key={layer} className="rounded-full bg-white/5 px-3 py-1">
                        {layer}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                    Featured records: {collection.featuredTitles.join(", ")}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Basic analytics</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <AnalyticsTile label="Burial layer" value={String(analytics.byLayer.BURIAL)} />
              <AnalyticsTile label="Home layer" value={String(analytics.byLayer.HOME)} />
              <AnalyticsTile label="Education layer" value={String(analytics.byLayer.EDUCATION)} />
              <AnalyticsTile label="History layer" value={String(analytics.byLayer.HISTORY)} />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
              Memorial records currently visible: {analytics.memorialRecords}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3 text-white">
              <FileBarChart2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Read-only reporting views</span>
            </div>
            <div className="mt-4 space-y-3">
              {reports.map((report) => (
                <article key={report.sector} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold text-white">{report.label}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                      {report.totalCollections} collections
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-white/68 sm:grid-cols-3">
                    <div>Records: {report.totalRecords}</div>
                    <div>Published: {report.publishedRecords}</div>
                    <div>Review queue: {report.reviewQueueRecords}</div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
                    Top institution: {report.topInstitution}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{report.focusSummary}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm text-white/55">{helper}</p>
    </div>
  );
}

function AnalyticsTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-white/70">
        <Landmark className="h-4 w-4 text-primary" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function formatSectorLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());
}
