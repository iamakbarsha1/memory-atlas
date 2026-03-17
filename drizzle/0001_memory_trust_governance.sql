CREATE TYPE "memory_sensitivity" AS ENUM ('STANDARD', 'SENSITIVE', 'MEMORIAL');
CREATE TYPE "memory_trust_label" AS ENUM (
  'UNVERIFIED',
  'FAMILY_CONFIRMED',
  'INSTITUTION_CONFIRMED',
  'HISTORICALLY_VERIFIED'
);

ALTER TABLE "memories"
  ADD COLUMN "trust_label" "memory_trust_label" DEFAULT 'UNVERIFIED' NOT NULL,
  ADD COLUMN "sensitivity" "memory_sensitivity" DEFAULT 'STANDARD' NOT NULL,
  ADD COLUMN "review_notes" text,
  ADD COLUMN "respectful_handling_notes" text,
  ADD COLUMN "reviewed_by" text,
  ADD COLUMN "reviewed_at" timestamp,
  ADD COLUMN "hide_precise_location" boolean DEFAULT false NOT NULL;

CREATE INDEX "memories_status_idx" ON "memories" ("status");
CREATE INDEX "memories_sensitivity_idx" ON "memories" ("sensitivity");
