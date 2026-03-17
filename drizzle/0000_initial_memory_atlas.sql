CREATE TYPE "memory_layer" AS ENUM ('BURIAL', 'HOME', 'EDUCATION', 'HISTORY');
CREATE TYPE "memory_source_type" AS ENUM ('FAMILY', 'INSTITUTION', 'HISTORICAL', 'PERSONAL', 'OTHER');
CREATE TYPE "memory_status" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "memory_type" AS ENUM ('BURIAL', 'BIRTH', 'HOME', 'EDUCATION', 'HISTORY', 'MILESTONE');
CREATE TYPE "memory_visibility" AS ENUM ('PRIVATE', 'FAMILY', 'PUBLIC');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "full_name" text,
  "avatar_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "people" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "birth_date" timestamp,
  "death_date" timestamp,
  "bio" text,
  "user_id" uuid REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "memories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "layer" "memory_layer" NOT NULL,
  "type" "memory_type" NOT NULL,
  "latitude" numeric(10, 7) NOT NULL,
  "longitude" numeric(10, 7) NOT NULL,
  "person_id" uuid REFERENCES "people"("id"),
  "user_id" uuid REFERENCES "users"("id"),
  "metadata" jsonb,
  "media_urls" text[],
  "date_occurred" timestamp,
  "source_type" "memory_source_type" NOT NULL,
  "source_name" text NOT NULL,
  "source_url" text,
  "source_notes" text,
  "visibility" "memory_visibility" DEFAULT 'PRIVATE' NOT NULL,
  "status" "memory_status" DEFAULT 'DRAFT' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "relationships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "person_id" uuid NOT NULL REFERENCES "people"("id"),
  "related_person_id" uuid NOT NULL REFERENCES "people"("id"),
  "type" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "memories_user_id_idx" ON "memories" ("user_id");
CREATE INDEX "memories_layer_idx" ON "memories" ("layer");
CREATE INDEX "memories_date_occurred_idx" ON "memories" ("date_occurred");
