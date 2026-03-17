"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Globe,
  GraduationCap,
  HeartHandshake,
  Home,
  Landmark,
  Layers3,
  MapPinned,
  ShieldCheck,
  Sprout,
  Users,
  X,
} from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { GlobeScene } from "@/components/globe/GlobeScene";
import { MemoryWorkspace } from "@/components/memories/MemoryWorkspace";
import { useAuth } from "@/context/AuthContext";
import { buildPlaceHubs, demoPlaceMemories } from "@/features/place-hubs/utils";

const memoryLayers = [
  {
    icon: Landmark,
    title: "Burial Layer",
    description:
      "Preserve cemetery records, help families find graves, and make burial locations searchable with context.",
    accentClass: "memory-gradient-grave",
  },
  {
    icon: Home,
    title: "Family Homes Layer",
    description:
      "Record the homes where generations lived so family heritage can remain tied to real places.",
    accentClass: "memory-gradient-home",
  },
  {
    icon: GraduationCap,
    title: "Education Layer",
    description:
      "Attach schools, universities, and formative study years to a person’s geographic story.",
    accentClass: "memory-gradient-campus",
  },
  {
    icon: BookOpen,
    title: "Historical Moments Layer",
    description:
      "Capture the ordinary and extraordinary events that shaped a person, family, or community.",
    accentClass: "border-white/10 bg-white/5",
  },
];

const lifeJourney = [
  { place: "Madurai", label: "Born", icon: Sprout },
  { place: "Chennai", label: "Studied", icon: GraduationCap },
  { place: "Dubai", label: "Worked", icon: Building2 },
  { place: "Chennai", label: "Buried", icon: MapPinned },
];

const principles = [
  "Designed for remembrance, preservation, and family heritage.",
  "Avoids entertainment patterns or worship-like interactions around graves.",
  "Supports respectful use across Muslim, Christian, Jewish, Hindu, and secular communities.",
];

const institutions = [
  "Mosques and churches",
  "Universities and alumni archives",
  "Historical societies and museums",
  "Cemeteries and memorial parks",
];

const businessTracks = [
  {
    title: "Cemetery Software",
    description: "Digitize burial records, plot sections, and maintain searchable archives.",
  },
  {
    title: "Family Archives",
    description: "Offer secure memory storage, family trees, and place-based timelines.",
  },
  {
    title: "Cultural Data",
    description: "License curated place-memory datasets to cities, museums, and researchers.",
  },
];

const placeHubPreviews = buildPlaceHubs(demoPlaceMemories).slice(0, 3);

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-15%] left-[-10%] h-[32rem] w-[32rem] rounded-full bg-primary blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-[150px]" />
      </div>

      <nav className="fixed top-0 left-0 z-50 w-full border-b border-white/5 bg-background/65 px-6 py-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xl font-bold tracking-tight">MEMORY ATLAS</div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">
                Memory Layer For Earth
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 md:block">
                  {user.email}
                </div>
                <button
                  onClick={() => void signOut()}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(99,102,241,0.45)]"
                >
                  Start Building
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto flex max-w-7xl flex-col gap-28 px-6 pb-20 pt-30">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/65 backdrop-blur-sm">
              <Layers3 className="h-3.5 w-3.5 text-primary" />
              Future Vision In Product Form
            </div>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tighter md:text-7xl md:leading-[0.92]">
              A living map of where
              <span className="block text-primary italic">human life happened.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
              Memory Atlas turns places into memory records: burial sites, birthplaces,
              schools, homes, and historical moments, all preserved with respect and tied
              to the geography of real lives.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setAuthMode("signup")}
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(99,102,241,0.45)]"
              >
                Start Your Atlas <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#user-story-plan"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center text-lg font-bold text-white transition-colors hover:bg-white/10"
              >
                View Product Plan
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="glass-panel overflow-hidden rounded-[2rem]"
          >
            <div className="border-b border-white/10 px-6 py-4">
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-white/40">
                Map Preview
              </div>
            </div>
            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="h-[24rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                <GlobeScene />
              </div>
              <div className="space-y-4">
                <div className="glass-card p-5">
                  <div className="mb-2 text-xs uppercase tracking-[0.25em] text-white/40">
                    Active Layers
                  </div>
                  <div className="space-y-3 text-sm text-white/70">
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <span>Burial Places</span>
                      <span className="text-amber-300">On</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <span>Family Homes</span>
                      <span className="text-blue-300">On</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <span>Education</span>
                      <span className="text-emerald-300">On</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                      <span>Historical Moments</span>
                      <span className="text-white/70">Off</span>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-5">
                  <div className="mb-2 text-xs uppercase tracking-[0.25em] text-white/40">
                    Vision
                  </div>
                  <p className="text-sm leading-relaxed text-white/65">
                    Build a global memory map where every generation can leave a geographic
                    record of life, migration, study, work, burial, and belonging.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {user ? <MemoryWorkspace userId={user.id} userName={user.user_metadata?.full_name as string | undefined} /> : null}

        <section>
          <div className="mb-8 max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
              Core Layers
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Every location can hold a memory record.
            </h2>
            <p className="mt-3 text-white/55">
              The current product should evolve from single memory pins into a structured
              layer system that families and institutions can browse, filter, and preserve.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {memoryLayers.map((layer, index) => (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08 }}
                className={`glass-card p-6 ${layer.accentClass}`}
              >
                <layer.icon className="mb-5 h-8 w-8 text-white" />
                <h3 className="text-xl font-semibold">{layer.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {layer.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
              Family Timeline
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Map a person’s life journey.</h2>
            <p className="mt-3 max-w-xl text-white/55">
              A family tree becomes much more useful when each person can be viewed through
              the places that shaped their life, not only through names and dates.
            </p>
            <div className="mt-8 space-y-4">
              {lifeJourney.map((step) => (
                <div
                  key={`${step.label}-${step.place}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
                >
                  <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-white/40">
                      {step.label}
                    </div>
                    <div className="text-lg font-semibold">{step.place}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="glass-panel rounded-[2rem] p-8">
              <div className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
                <ShieldCheck className="h-4 w-4" />
                Ethical Design
              </div>
              <div className="space-y-4">
                {principles.map((principle) => (
                  <div
                    key={principle}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white/75"
                  >
                    {principle}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-panel rounded-[2rem] p-8">
                <div className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
                  <HeartHandshake className="h-4 w-4" />
                  Institutions
                </div>
                <div className="space-y-3 text-white/70">
                  {institutions.map((institution) => (
                    <div key={institution} className="rounded-2xl bg-white/5 px-4 py-3">
                      {institution}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[2rem] p-8">
                <div className="mb-3 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
                  <Users className="h-4 w-4" />
                  Business Model
                </div>
                <div className="space-y-3">
                  {businessTracks.map((track) => (
                    <div key={track.title} className="rounded-2xl bg-white/5 px-4 py-4">
                      <div className="font-semibold">{track.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">
                        {track.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-8 md:p-10">
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
              Canonical Place Hubs
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Give each place its own memory page.
            </h2>
            <p className="mt-3 text-white/55">
              Dedicated place hubs gather nearby memories, partner collections, and map context into one canonical view for a city, campus, cemetery, or archive site.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {placeHubPreviews.map((hub) => (
              <Link
                key={hub.slug}
                href={`/places/${hub.slug}`}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
              >
                <div className="text-xs uppercase tracking-[0.25em] text-primary/75">
                  {hub.layers.join(" · ")}
                </div>
                <div className="mt-3 text-2xl font-semibold">{hub.placeName}</div>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{hub.summary}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-white/55">
                  <span>{hub.totalRecords} mapped memories</span>
                  <span>Open hub</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="user-story-plan"
          className="glass-panel rounded-[2rem] p-8 md:p-10"
        >
          <div className="max-w-3xl">
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/75">
              Delivery Plan
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Build from memorial records to a global memory map.
            </h2>
            <p className="mt-3 text-white/55">
              The repo now includes a structured user-story plan for the next implementation
              phases, starting with a memory layer MVP and extending into family timelines,
              moderation, and institutional tooling.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Phase 1: Memory record model and layer-aware CRUD",
              "Phase 2: Map filters, search, and detail panels",
              "Phase 3: Family journeys and person timelines",
              "Phase 4: Governance, moderation, and institution workflows",
            ].map((phase) => (
              <div key={phase} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5">
                <div className="text-sm font-semibold leading-relaxed text-white/80">{phase}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {authMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-[40px] border border-white/10 bg-secondary p-10 shadow-2xl"
            >
              <button
                onClick={() => setAuthMode(null)}
                className="absolute top-6 right-6 rounded-full p-2 transition-colors hover:bg-white/5"
              >
                <X className="h-6 w-6 text-white/40" />
              </button>

              <div className="mb-8 text-center">
                <Globe className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">
                  {authMode === "login" ? "Welcome Back" : "Join the Atlas"}
                </h2>
                <p className="mt-2 text-white/40">
                  {authMode === "login"
                    ? "Access your family memories"
                    : "Begin your preservation journey"}
                </p>
              </div>

              {authMode === "login" ? (
                <LoginForm onSuccess={() => setAuthMode(null)} />
              ) : (
                <SignupForm onSuccess={() => setAuthMode(null)} />
              )}

              <div className="mt-8 border-t border-white/5 pt-8 text-center text-sm">
                <span className="text-white/40">
                  {authMode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </span>{" "}
                <button
                  onClick={() =>
                    setAuthMode(authMode === "login" ? "signup" : "login")
                  }
                  className="font-bold text-primary hover:underline"
                >
                  {authMode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
