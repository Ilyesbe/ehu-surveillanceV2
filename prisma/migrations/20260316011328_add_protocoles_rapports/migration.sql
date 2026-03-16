-- CreateEnum
CREATE TYPE "Perimetre" AS ENUM ('commune', 'wilaya', 'national');

-- CreateEnum
CREATE TYPE "Gravite" AS ENUM ('attention', 'urgent', 'critique');

-- CreateEnum
CREATE TYPE "RapportType" AS ENUM ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'personnalise');

-- CreateEnum
CREATE TYPE "RapportStatut" AS ENUM ('en_cours', 'genere', 'erreur');

-- CreateEnum
CREATE TYPE "GenerePar" AS ENUM ('systeme', 'utilisateur');

-- AlterTable
ALTER TABLE "maladies" ADD COLUMN     "declaration_obligatoire" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "delai_notification_heures" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "periode_defaut_jours" INTEGER NOT NULL DEFAULT 30;

-- CreateTable
CREATE TABLE "protocoles" (
    "id" TEXT NOT NULL,
    "maladie_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "conduite_medicale" JSONB NOT NULL,
    "actions_administratives" JSONB NOT NULL,
    "investigation_steps" JSONB NOT NULL,
    "posologies" JSONB,
    "mesures_prevention" JSONB,
    "duree_surveillance" INTEGER,
    "pdf_url" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "protocoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seuils_alerte" (
    "id" TEXT NOT NULL,
    "maladie_id" TEXT NOT NULL,
    "perimetre" "Perimetre" NOT NULL,
    "commune_id" TEXT,
    "wilaya_id" TEXT,
    "seuil_nombre" INTEGER NOT NULL,
    "periode_jours" INTEGER NOT NULL DEFAULT 30,
    "gravite" "Gravite" NOT NULL,
    "auto_alerte" BOOLEAN NOT NULL DEFAULT true,
    "auto_notification" BOOLEAN NOT NULL DEFAULT true,
    "configured_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seuils_alerte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protocole_declenchements" (
    "id" TEXT NOT NULL,
    "protocole_id" TEXT NOT NULL,
    "seuil_id" TEXT NOT NULL,
    "alerte_id" TEXT,
    "cas_declencheur_id" TEXT NOT NULL,
    "nombre_cas_actuel" INTEGER NOT NULL,
    "commune_id" TEXT,
    "maladie_id" TEXT NOT NULL,
    "vu_par_medecin" BOOLEAN NOT NULL DEFAULT false,
    "pdf_telecharge" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocole_declenchements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapports" (
    "id" TEXT NOT NULL,
    "type" "RapportType" NOT NULL,
    "titre" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "donnees" JSONB NOT NULL,
    "pdf_url" TEXT,
    "excel_url" TEXT,
    "genere_par" "GenerePar" NOT NULL DEFAULT 'utilisateur',
    "created_by" TEXT,
    "statut" "RapportStatut" NOT NULL DEFAULT 'genere',
    "wilaya_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "protocoles_maladie_id_key" ON "protocoles"("maladie_id");

-- AddForeignKey
ALTER TABLE "protocoles" ADD CONSTRAINT "protocoles_maladie_id_fkey" FOREIGN KEY ("maladie_id") REFERENCES "maladies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocoles" ADD CONSTRAINT "protocoles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocoles" ADD CONSTRAINT "protocoles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seuils_alerte" ADD CONSTRAINT "seuils_alerte_maladie_id_fkey" FOREIGN KEY ("maladie_id") REFERENCES "maladies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seuils_alerte" ADD CONSTRAINT "seuils_alerte_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seuils_alerte" ADD CONSTRAINT "seuils_alerte_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seuils_alerte" ADD CONSTRAINT "seuils_alerte_configured_by_fkey" FOREIGN KEY ("configured_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocole_declenchements" ADD CONSTRAINT "protocole_declenchements_protocole_id_fkey" FOREIGN KEY ("protocole_id") REFERENCES "protocoles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocole_declenchements" ADD CONSTRAINT "protocole_declenchements_seuil_id_fkey" FOREIGN KEY ("seuil_id") REFERENCES "seuils_alerte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocole_declenchements" ADD CONSTRAINT "protocole_declenchements_cas_declencheur_id_fkey" FOREIGN KEY ("cas_declencheur_id") REFERENCES "cas_declares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protocole_declenchements" ADD CONSTRAINT "protocole_declenchements_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapports" ADD CONSTRAINT "rapports_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapports" ADD CONSTRAINT "rapports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
