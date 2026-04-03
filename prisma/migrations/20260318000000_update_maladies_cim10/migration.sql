-- Migration: update_maladies_cim10
-- Replaces codeMdo with codeCim10 and restructures Maladie model
-- Also makes modeConfirmation nullable String in CasDeclare

-- Step 1: Drop the ModeConfirmation enum column (convert to nullable text)
ALTER TABLE "cas_declares" ALTER COLUMN "mode_confirmation" TYPE TEXT;
ALTER TABLE "cas_declares" ALTER COLUMN "mode_confirmation" DROP NOT NULL;

-- Step 2: Add new columns to maladies (all nullable first)
ALTER TABLE "maladies" ADD COLUMN IF NOT EXISTS "code_cim10" TEXT;
ALTER TABLE "maladies" ADD COLUMN IF NOT EXISTS "nom_court" TEXT;
ALTER TABLE "maladies" ADD COLUMN IF NOT EXISTS "seuil_defaut" INTEGER;
ALTER TABLE "maladies" ADD COLUMN IF NOT EXISTS "categorie_gravite" TEXT;
ALTER TABLE "maladies" ADD COLUMN IF NOT EXISTS "has_fiche_specifique" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "maladies" ADD COLUMN IF NOT EXISTS "fiche_specifique_slug" TEXT;
ALTER TABLE "maladies" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 3: Populate code_cim10 from code_mdo (using old MDO codes as placeholder)
UPDATE "maladies" SET "code_cim10" = 'LEGACY-' || "code_mdo" WHERE "code_cim10" IS NULL;

-- Step 4: Now make code_cim10 NOT NULL and add unique constraint
ALTER TABLE "maladies" ALTER COLUMN "code_cim10" SET NOT NULL;
ALTER TABLE "maladies" ADD CONSTRAINT "maladies_code_cim10_key" UNIQUE ("code_cim10");

-- Step 5: Drop old columns
ALTER TABLE "maladies" DROP COLUMN IF EXISTS "code_mdo";
ALTER TABLE "maladies" DROP COLUMN IF EXISTS "seuil_alerte";
ALTER TABLE "maladies" DROP COLUMN IF EXISTS "declaration_obligatoire";

-- Step 6: Drop the ModeConfirmation enum type (if it exists as a type in postgres)
DROP TYPE IF EXISTS "ModeConfirmation";
