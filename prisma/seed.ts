import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { MALADIES_SEED } from "./seeds/maladies"
import { PERMISSIONS_SEED, ROLES_SEED } from "./seeds/roles-permissions"

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

  // Communes Oran
  console.log("Seeding communes Oran...")
  const oranId = wilayas["31"]
  for (const c of COMMUNES_ORAN) {
    const existing = await prisma.commune.findFirst({ where: { nom: c.nom, wilayadId: oranId } })
    if (!existing) {
      await prisma.commune.create({
        data: { nom: c.nom, wilayadId: oranId, latitude: c.lat, longitude: c.lng },
      })
    }
  }

  // 83 Maladies CIM-10
  console.log("Seeding 83 maladies CIM-10...")
  for (const m of MALADIES_SEED) {
    await prisma.maladie.upsert({
      where: { codeCim10: m.codeCim10 },
      update: {
        nom: m.nom, categorie: m.categorie, nomCourt: m.nomCourt,
        seuilDefaut: m.seuilDefaut, categorieGravite: m.categorieGravite,
        delaiNotificationHeures: m.delaiNotificationHeures,
        hasFicheSpecifique: m.hasFicheSpecifique,
        ficheSpecifiqueSlug: (m as { ficheSpecifiqueSlug?: string }).ficheSpecifiqueSlug ?? null,
      },
      create: {
        nom: m.nom, codeCim10: m.codeCim10, categorie: m.categorie,
        nomCourt: m.nomCourt ?? null, seuilDefaut: m.seuilDefaut ?? null,
        categorieGravite: m.categorieGravite ?? null,
        delaiNotificationHeures: m.delaiNotificationHeures ?? null,
        hasFicheSpecifique: m.hasFicheSpecifique,
        ficheSpecifiqueSlug: (m as { ficheSpecifiqueSlug?: string }).ficheSpecifiqueSlug ?? null,
        isActive: true,
      },
    })
  }

  // Etablissement EHU
  console.log("Seeding EHU Oran...")
  const oranCommune = await prisma.commune.findFirst({ where: { nom: "Oran", wilayadId: oranId } })
  let ehu = await prisma.etablissement.findFirst({ where: { nom: "EHU Oran" } })
  if (!ehu) {
    ehu = await prisma.etablissement.create({
      data: { nom: "EHU Oran", type: "CHU", communeId: oranCommune?.id, wilayadId: oranId, adresse: "BP 4166 Ibn Rochd, Oran 31000" },
    })
  }

  // 30 Permissions
  console.log("Seeding 30 permissions...")
  const permissionIds: Record<string, string> = {}
  for (const p of PERMISSIONS_SEED) {
    const perm = await prisma.permission.upsert({
      where: { slug: p.slug },
      update: { name: p.name, module: p.module },
      create: { slug: p.slug, name: p.name, module: p.module },
    })
    permissionIds[p.slug] = perm.id
  }

  // 3 Roles
  console.log("Seeding 3 roles systeme...")
  const roleIds: Record<string, string> = {}
  for (const r of ROLES_SEED) {
    const role = await prisma.role.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description, color: r.color },
      create: { name: r.name, slug: r.slug, description: r.description, color: r.color, isSystem: r.isSystem, isActive: true },
    })
    roleIds[r.slug] = role.id
    for (const permSlug of r.permissions) {
      const permId = permissionIds[permSlug]
      if (!permId) continue
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      })
    }
  }

  // Demo users
  console.log("Seeding demo users...")
  const adminHash = await bcrypt.hash("Admin@1234", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@ehu-oran.dz" },
    update: {},
    create: { email: "admin@ehu-oran.dz", passwordHash: adminHash, firstName: "Admin", lastName: "Systeme", etablissementId: ehu.id, wilayadId: oranId, isActive: true },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: roleIds["admin"] } },
    update: {}, create: { userId: admin.id, roleId: roleIds["admin"] },
  })

  const medecinHash = await bcrypt.hash("Medecin@1234", 12)
  const medecin = await prisma.user.upsert({
    where: { email: "medecin@ehu-oran.dz" },
    update: {},
    create: { email: "medecin@ehu-oran.dz", passwordHash: medecinHash, firstName: "Dr. Ahmed", lastName: "Benali", etablissementId: ehu.id, wilayadId: oranId, isActive: true },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: medecin.id, roleId: roleIds["medecin"] } },
    update: {}, create: { userId: medecin.id, roleId: roleIds["medecin"] },
  })

  const epidHash = await bcrypt.hash("Epidemio@1234", 12)
  const epid = await prisma.user.upsert({
    where: { email: "epidemio@ehu-oran.dz" },
    update: {},
    create: { email: "epidemio@ehu-oran.dz", passwordHash: epidHash, firstName: "Dr. Fatima", lastName: "Hadj", etablissementId: ehu.id, wilayadId: oranId, isActive: true },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: epid.id, roleId: roleIds["epidemiologiste"] } },
    update: {}, create: { userId: epid.id, roleId: roleIds["epidemiologiste"] },
  })

  console.log("\nSeed complete!")
  console.log("  admin@ehu-oran.dz     / Admin@1234")
  console.log("  medecin@ehu-oran.dz   / Medecin@1234")
  console.log("  epidemio@ehu-oran.dz  / Epidemio@1234")
}

main().catch(console.error).finally(() => prisma.$disconnect())
