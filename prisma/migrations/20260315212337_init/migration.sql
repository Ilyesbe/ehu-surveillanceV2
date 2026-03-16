-- CreateEnum
CREATE TYPE "Role" AS ENUM ('medecin', 'epidemiologiste', 'admin');

-- CreateEnum
CREATE TYPE "CasStatut" AS ENUM ('nouveau', 'en_cours', 'confirme', 'infirme', 'cloture');

-- CreateEnum
CREATE TYPE "ModeConfirmation" AS ENUM ('clinique', 'epidemiologique', 'laboratoire');

-- CreateEnum
CREATE TYPE "AlerteType" AS ENUM ('epidemique', 'seuil', 'information');

-- CreateEnum
CREATE TYPE "AlerteStatut" AS ENUM ('active', 'resolue', 'archivee');

-- CreateEnum
CREATE TYPE "ContactStatut" AS ENUM ('a_contacter', 'contacte', 'sous_surveillance', 'libere');

-- CreateEnum
CREATE TYPE "InvestigationStatut" AS ENUM ('en_cours', 'terminee', 'en_attente');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('homme', 'femme');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "etablissement_id" TEXT,
    "wilaya_id" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "sex" "Sexe" NOT NULL,
    "address" TEXT NOT NULL,
    "commune_id" TEXT,
    "phone" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cas_declares" (
    "id" TEXT NOT NULL,
    "code_cas" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "maladie_id" TEXT NOT NULL,
    "date_debut_symptomes" TIMESTAMP(3) NOT NULL,
    "date_diagnostic" TIMESTAMP(3) NOT NULL,
    "mode_confirmation" "ModeConfirmation" NOT NULL,
    "resultat_labo" TEXT,
    "statut" "CasStatut" NOT NULL DEFAULT 'nouveau',
    "etablissement_id" TEXT,
    "service" TEXT NOT NULL,
    "medecin_id" TEXT,
    "notes_cliniques" TEXT,
    "commune_id" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cas_declares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigations" (
    "id" TEXT NOT NULL,
    "cas_id" TEXT NOT NULL,
    "epidemiologiste_id" TEXT,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "statut" "InvestigationStatut" NOT NULL DEFAULT 'en_cours',
    "conclusion" TEXT,
    "mesures_controle" JSONB,
    "zone_geographique" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "investigation_id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "relation" TEXT,
    "statut_suivi" "ContactStatut" NOT NULL DEFAULT 'a_contacter',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes" (
    "id" TEXT NOT NULL,
    "type" "AlerteType" NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maladie_id" TEXT,
    "commune_id" TEXT,
    "nombre_cas" INTEGER NOT NULL,
    "recommandations" JSONB,
    "statut" "AlerteStatut" NOT NULL DEFAULT 'active',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "alertes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maladies" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code_mdo" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "seuil_alerte" INTEGER NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "maladies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etablissements" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "commune_id" TEXT,
    "wilaya_id" TEXT,
    "adresse" TEXT,

    CONSTRAINT "etablissements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wilayas" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "wilayas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "wilaya_id" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),

    CONSTRAINT "communes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fichiers" (
    "id" TEXT NOT NULL,
    "cas_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fichiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "details" JSONB,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_identifiant_key" ON "patients"("identifiant");

-- CreateIndex
CREATE UNIQUE INDEX "cas_declares_code_cas_key" ON "cas_declares"("code_cas");

-- CreateIndex
CREATE UNIQUE INDEX "investigations_cas_id_key" ON "investigations"("cas_id");

-- CreateIndex
CREATE UNIQUE INDEX "maladies_code_mdo_key" ON "maladies"("code_mdo");

-- CreateIndex
CREATE UNIQUE INDEX "wilayas_code_key" ON "wilayas"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_declares" ADD CONSTRAINT "cas_declares_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_declares" ADD CONSTRAINT "cas_declares_maladie_id_fkey" FOREIGN KEY ("maladie_id") REFERENCES "maladies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_declares" ADD CONSTRAINT "cas_declares_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_declares" ADD CONSTRAINT "cas_declares_medecin_id_fkey" FOREIGN KEY ("medecin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cas_declares" ADD CONSTRAINT "cas_declares_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_cas_id_fkey" FOREIGN KEY ("cas_id") REFERENCES "cas_declares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_epidemiologiste_id_fkey" FOREIGN KEY ("epidemiologiste_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_investigation_id_fkey" FOREIGN KEY ("investigation_id") REFERENCES "investigations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_maladie_id_fkey" FOREIGN KEY ("maladie_id") REFERENCES "maladies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etablissements" ADD CONSTRAINT "etablissements_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etablissements" ADD CONSTRAINT "etablissements_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "wilayas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communes" ADD CONSTRAINT "communes_wilaya_id_fkey" FOREIGN KEY ("wilaya_id") REFERENCES "wilayas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichiers" ADD CONSTRAINT "fichiers_cas_id_fkey" FOREIGN KEY ("cas_id") REFERENCES "cas_declares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
