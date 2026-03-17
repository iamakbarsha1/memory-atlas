ALTER TABLE "memories"
  ADD COLUMN "place_name" text NOT NULL DEFAULT 'Unknown place';

CREATE INDEX "memories_place_name_idx" ON "memories" ("place_name");
