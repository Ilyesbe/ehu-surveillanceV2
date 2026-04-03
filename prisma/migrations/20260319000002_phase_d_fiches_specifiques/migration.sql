-- Phase D: Add specific form data columns to cas_declares
ALTER TABLE "cas_declares" ADD COLUMN IF NOT EXISTS "donnees_specifiques" JSONB;
ALTER TABLE "cas_declares" ADD COLUMN IF NOT EXISTS "fiche_specifique_type" TEXT;

-- Create fiches_specifiques_templates table
CREATE TABLE IF NOT EXISTS "fiches_specifiques_templates" (
  "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "slug"       TEXT NOT NULL,
  "nom"        TEXT NOT NULL,
  "schema_json" JSONB,
  "version"    INTEGER NOT NULL DEFAULT 1,
  "is_active"  BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fiches_specifiques_templates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "fiches_specifiques_templates_slug_key" ON "fiches_specifiques_templates"("slug");
