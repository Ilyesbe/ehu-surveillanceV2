-- AlterTable
ALTER TABLE "cas_declares" ADD COLUMN     "cas_similaire_id" TEXT,
ADD COLUMN     "evaluation_clinique" JSONB,
ADD COLUMN     "nationalite_code" TEXT,
ADD COLUMN     "service_hospitalisation" TEXT,
ADD COLUMN     "structure_hospitalisation_id" TEXT;

-- CreateTable
CREATE TABLE "symptomes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "categorie" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "symptomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cas_symptomes" (
    "id" TEXT NOT NULL,
    "cas_id" TEXT NOT NULL,
    "symptome_id" TEXT NOT NULL,
    "intensite" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cas_symptomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cas_lieux" (
    "id" TEXT NOT NULL,
    "cas_id" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT,
    "adresse" TEXT,
    "commune_id" TEXT,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cas_lieux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "germes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "germes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultats_labo" (
    "id" TEXT NOT NULL,
    "cas_id" TEXT NOT NULL,
    "type_prelevement" TEXT NOT NULL,
    "date_prelevement" TIMESTAMP(3) NOT NULL,
    "date_resultat" TIMESTAMP(3),
    "germe_id" TEXT,
    "resultat" TEXT,
    "antibiogramme" TEXT,
    "laboratoire" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultats_labo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "symptomes_nom_key" ON "symptomes"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "symptomes_code_key" ON "symptomes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cas_symptomes_cas_id_symptome_id_key" ON "cas_symptomes"("cas_id", "symptome_id");

-- CreateIndex
CREATE UNIQUE INDEX "cas_lieux_cas_id_ordre_key" ON "cas_lieux"("cas_id", "ordre");

-- CreateIndex
CREATE UNIQUE INDEX "germes_nom_key" ON "germes"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "germes_code_key" ON "germes"("code");

-- AddForeignKey
ALTER TABLE "cas_declares" ADD CONSTRAINT "cas_declares_cas_similaire_id_fkey" FOREIGN KEY ("cas_similaire_id") REFERENCES "cas_declares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_declares" ADD CONSTRAINT "cas_declares_structure_hospitalisation_id_fkey" FOREIGN KEY ("structure_hospitalisation_id") REFERENCES "etablissements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_symptomes" ADD CONSTRAINT "cas_symptomes_cas_id_fkey" FOREIGN KEY ("cas_id") REFERENCES "cas_declares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_symptomes" ADD CONSTRAINT "cas_symptomes_symptome_id_fkey" FOREIGN KEY ("symptome_id") REFERENCES "symptomes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_lieux" ADD CONSTRAINT "cas_lieux_cas_id_fkey" FOREIGN KEY ("cas_id") REFERENCES "cas_declares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_lieux" ADD CONSTRAINT "cas_lieux_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_labo" ADD CONSTRAINT "resultats_labo_cas_id_fkey" FOREIGN KEY ("cas_id") REFERENCES "cas_declares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultats_labo" ADD CONSTRAINT "resultats_labo_germe_id_fkey" FOREIGN KEY ("germe_id") REFERENCES "germes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
