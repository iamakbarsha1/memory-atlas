ALTER TABLE "memories"
  ADD COLUMN "institution_name" text,
  ADD COLUMN "reviewer_assigned_to" text,
  ADD COLUMN "reviewer_assigned_at" timestamp,
  ADD COLUMN "moderation_decision_note" text,
  ADD COLUMN "import_batch_id" text;

CREATE TABLE "moderation_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES "users"("id"),
  "memory_id" uuid NOT NULL REFERENCES "memories"("id"),
  "action" text NOT NULL,
  "actor_name" text,
  "reviewer_assigned_to" text,
  "institution_name" text,
  "note" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "memories_reviewer_assigned_to_idx" ON "memories" ("reviewer_assigned_to");
CREATE INDEX "memories_institution_name_idx" ON "memories" ("institution_name");
CREATE INDEX "moderation_audit_logs_user_id_idx" ON "moderation_audit_logs" ("user_id");
CREATE INDEX "moderation_audit_logs_memory_id_idx" ON "moderation_audit_logs" ("memory_id");
