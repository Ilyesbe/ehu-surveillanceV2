import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const WILAYAS = [
  { code: "01", nom: "Adrar" }, { code: "02", nom: "Chlef" }, { code: "03", nom: "Laghouat" },
  { code: "04", nom: "Oum El Bouaghi" }, { code: "05", nom: "Batna" }, { code: "06", nom: "Béjaïa" },
  { code: "07", nom: "Biskra" }, { code: "08", nom: "Béchar" }, { code: "09", nom: "Blida" },
  { code: "10", nom: "Bouira" }, { code: "11", nom: "Tamanrasset" }, { code: "12", nom: "Tébessa" },
  { code: "13", nom: "Tlemcen" }, { code: "14", nom: "Tiaret" }, { code: "15", nom: "Tizi Ouzou" },
  { code: "16", nom: "Alger" }, { code: "17", nom: "Djelfa" }, { code: "18", nom: "Jijel" },
  { code: "19", nom: "Sétif" }, { code: "20", nom: "Saïda" }, { code: "21", nom: "Skikda" },
  { code: "22", nom: "Sidi Bel Abbès" }, { code: "23", nom: "Annaba" }, { code: "24", nom: "Guelma" },
  { code: "25", nom: "Constantine" }, { code: "26", nom: "Médéa" }, { code: "27", nom: "Mostaganem" },
  { code: "28", nom: "M'Sila" }, { code: "29", nom: "Mascara" }, { code: "30", nom: "Ouargla" },
  { code: "31", nom: "Oran" }, { code: "32", nom: "El Bayadh" }, { code: "33", nom: "Illizi" },
  { code: "34", nom: "Bordj Bou Arréridj" }, { code: "35", nom: "Boumerdès" }, { code: "36", nom: "El Tarf" },
  { code: "37", nom: "Tindouf" }, { code: "38", nom: "Tissemsilt" }, { code: "39", nom: "El Oued" },
  { code: "40", nom: "Khenchela" }, { code: "41", nom: "Souk Ahras" }, { code: "42", nom: "Tipaza" },
  { code: "43", nom: "Mila" }, { code: "44", nom: "Aïn Defla" }, { code: "45", nom: "Naâma" },
  { code: "46", nom: "Aïn Témouchent" }, { code: "47", nom: "Ghardaïa" }, { code: "48", nom: "Relizane" },
]

const COMMUNES_ORAN = [
  { nom: "Oran", lat: 35.6969, lng: -0.6331 },
  { nom: "Es Sénia", lat: 35.6506, lng: -0.6017 },
  { nom: "Bir El Djir", lat: 35.7294, lng: -0.5853 },
  { nom: "Arzew", lat: 35.8306, lng: -0.3175 },
  { nom: "Bethioua", lat: 35.8, lng: -0.25 },
  { nom: "Mers El Kébir", lat: 35.7333, lng: -0.7167 },
  { nom: "Ain El Turk", lat: 35.7500, lng: -0.7667 },
  { nom: "El Ancor", lat: 35.75, lng: -0.5 },
  { nom: "Hassi Ben Okba", lat: 35.55, lng: -0.7 },
  { nom: "Sidi Chami", lat: 35.63, lng: -0.59 },
]

const MALADIES_MDO = [
  { nom: "Choléra", codeMdo: "MDO-001", categorie: "Maladies à transmission hydrique", seuilAlerte: 1 },
  { nom: "Typhoïde", codeMdo: "MDO-002", categorie: "Maladies à transmission hydrique", seuilAlerte: 5 },
  { nom: "Hépatite A", codeMdo: "MDO-003", categorie: "Maladies à transmission hydrique", seuilAlerte: 10 },
  { nom: "Paludisme", codeMdo: "MDO-004", categorie: "Maladies parasitaires", seuilAlerte: 3 },
  { nom: "Leishmaniose cutanée", codeMdo: "MDO-005", categorie: "Maladies parasitaires", seuilAlerte: 10 },
  { nom: "Leishmaniose viscérale", codeMdo: "MDO-006", categorie: "Maladies parasitaires", seuilAlerte: 3 },
  { nom: "Méningite bactérienne", codeMdo: "MDO-007", categorie: "Maladies à prévention vaccinale", seuilAlerte: 3 },
  { nom: "Rougeole", codeMdo: "MDO-008", categorie: "Maladies à prévention vaccinale", seuilAlerte: 5 },
  { nom: "Coqueluche", codeMdo: "MDO-009", categorie: "Maladies à prévention vaccinale", seuilAlerte: 5 },
  { nom: "Diphtérie", codeMdo: "MDO-010", categorie: "Maladies à prévention vaccinale", seuilAlerte: 1 },
  { nom: "Tétanos", codeMdo: "MDO-011", categorie: "Maladies à prévention vaccinale", seuilAlerte: 1 },
  { nom: "Poliomyélite", codeMdo: "MDO-012", categorie: "Maladies à prévention vaccinale", seuilAlerte: 1 },
  { nom: "Tuberculose pulmonaire", codeMdo: "MDO-013", categorie: "Maladies respiratoires", seuilAlerte: 10 },
  { nom: "COVID-19", codeMdo: "MDO-014", categorie: "Maladies respiratoires", seuilAlerte: 20 },
  { nom: "Grippe saisonnière", codeMdo: "MDO-015", categorie: "Maladies respiratoires", seuilAlerte: 50 },
  { nom: "Brucellose", codeMdo: "MDO-016", categorie: "Zoonoses", seuilAlerte: 5 },
  { nom: "Rage", codeMdo: "MDO-017", categorie: "Zoonoses", seuilAlerte: 1 },
  { nom: "Anthrax", codeMdo: "MDO-018", categorie: "Zoonoses", seuilAlerte: 1 },
  { nom: "Fièvre typhoïde", codeMdo: "MDO-019", categorie: "Maladies entériques", seuilAlerte: 5 },
  { nom: "Dysenterie bacillaire", codeMdo: "MDO-020", categorie: "Maladies entériques", seuilAlerte: 10 },
]

async function main() {
  console.log("Starting seed...")

  // Wilayas
  console.log("Seeding wilayas...")
  const wilayas: Record<string, string> = {}
  for (const w of WILAYAS) {
    const wilaya = await prisma.wilaya.upsert({
      where: { code: w.code },
      update: { nom: w.nom },
      create: { nom: w.nom, code: w.code },
    })
    wilayas[w.code] = wilaya.id
  }

  // Communes d'Oran
  console.log("Seeding communes d'Oran...")
  const oranId = wilayas["31"]
  for (const c of COMMUNES_ORAN) {
    const existing = await prisma.commune.findFirst({ where: { nom: c.nom, wilayadId: oranId } })
    if (!existing) {
      await prisma.commune.create({
        data: {
          nom: c.nom,
          wilayadId: oranId,
          latitude: c.lat,
          longitude: c.lng,
        },
      })
    }
  }

  // Maladies MDO
  console.log("Seeding maladies MDO...")
  for (const m of MALADIES_MDO) {
    await prisma.maladie.upsert({
      where: { codeMdo: m.codeMdo },
      update: { nom: m.nom, categorie: m.categorie, seuilAlerte: m.seuilAlerte },
      create: { ...m, isActive: true },
    })
  }

  // Etablissement EHU Oran
  console.log("Seeding EHU Oran...")
  const oranCommune = await prisma.commune.findFirst({ where: { nom: "Oran", wilayadId: oranId } })
  let ehu = await prisma.etablissement.findFirst({ where: { nom: "EHU Oran" } })
  if (!ehu) {
    ehu = await prisma.etablissement.create({
      data: {
        nom: "EHU Oran",
        type: "CHU",
        communeId: oranCommune?.id,
        wilayadId: oranId,
        adresse: "BP 4166 Ibn Rochd, Oran 31000",
      },
    })
  }

  // Admin user
  console.log("Seeding admin user...")
  const passwordHash = await bcrypt.hash("Admin@1234", 12)
  await prisma.user.upsert({
    where: { email: "admin@ehu-oran.dz" },
    update: {},
    create: {
      email: "admin@ehu-oran.dz",
      passwordHash,
      firstName: "Admin",
      lastName: "Système",
      role: "admin",
      etablissementId: ehu.id,
      wilayadId: oranId,
      isActive: true,
    },
  })

  // Demo médecin
  const medecinHash = await bcrypt.hash("Medecin@1234", 12)
  await prisma.user.upsert({
    where: { email: "medecin@ehu-oran.dz" },
    update: {},
    create: {
      email: "medecin@ehu-oran.dz",
      passwordHash: medecinHash,
      firstName: "Dr. Ahmed",
      lastName: "Benali",
      role: "medecin",
      etablissementId: ehu.id,
      wilayadId: oranId,
      isActive: true,
    },
  })

  // Demo épidémiologiste
  const epidHash = await bcrypt.hash("Epidemio@1234", 12)
  await prisma.user.upsert({
    where: { email: "epidemio@ehu-oran.dz" },
    update: {},
    create: {
      email: "epidemio@ehu-oran.dz",
      passwordHash: epidHash,
      firstName: "Dr. Fatima",
      lastName: "Hadj",
      role: "epidemiologiste",
      etablissementId: ehu.id,
      wilayadId: oranId,
      isActive: true,
    },
  })

  console.log("Seed complete!")
  console.log("")
  console.log("Demo accounts:")
  console.log("  admin@ehu-oran.dz / Admin@1234 (admin)")
  console.log("  medecin@ehu-oran.dz / Medecin@1234 (medecin)")
  console.log("  epidemio@ehu-oran.dz / Epidemio@1234 (epidemiologiste)")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
