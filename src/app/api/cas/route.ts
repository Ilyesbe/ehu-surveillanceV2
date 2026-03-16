import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateCaseCode, generatePatientId } from "@/utils/generate-id"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "10")
  const statut = searchParams.get("statut") ?? ""
  const maladieId = searchParams.get("maladieId") ?? ""
  const search = searchParams.get("search") ?? ""

  const where: Record<string, unknown> = {}
  if (statut) where.statut = statut
  if (maladieId) where.maladieId = maladieId
  if (search) {
    where.OR = [
      { patient: { firstName: { contains: search, mode: "insensitive" } } },
      { patient: { lastName: { contains: search, mode: "insensitive" } } },
      { codeCas: { contains: search, mode: "insensitive" } },
    ]
  }
  // Médecin can only see their own cases
  if (session.user.role === "medecin") {
    where.medecinId = session.user.id
  }

  const [cas, total] = await Promise.all([
    prisma.casDeclare.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        patient: true,
        maladie: true,
        commune: true,
        medecin: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.casDeclare.count({ where }),
  ])

  return NextResponse.json({ cas, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (!["medecin", "epidemiologiste", "admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  try {
    const body = await req.json()

    // Auto-create patient
    const patient = await prisma.patient.create({
      data: {
        identifiant: generatePatientId(),
        firstName: body.patient.firstName,
        lastName: body.patient.lastName,
        dateOfBirth: new Date(body.patient.dateOfBirth),
        sex: body.patient.sex,
        address: body.patient.address,
        communeId: body.patient.communeId || null,
        phone: body.patient.phone || null,
      },
    })

    // Create case
    const cas = await prisma.casDeclare.create({
      data: {
        codeCas: generateCaseCode(),
        patientId: patient.id,
        maladieId: body.maladieId,
        dateDebutSymptomes: new Date(body.dateDebutSymptomes),
        dateDiagnostic: new Date(body.dateDiagnostic),
        modeConfirmation: body.modeConfirmation,
        resultatLabo: body.resultatLabo || null,
        statut: "nouveau",
        etablissementId: body.etablissementId || session.user.etablissementId || null,
        service: body.service,
        medecinId: session.user.id,
        notesCliniques: body.notesCliniques || null,
        communeId: body.patient.communeId || null,
      },
      include: {
        patient: true,
        maladie: true,
      },
    })

    // Check seuils configurés and trigger protocole if threshold exceeded
    let declenchement = null
    const seuils = await prisma.seuilAlerte.findMany({
      where: { maladieId: body.maladieId, isActive: true },
      include: { maladie: true },
    })

    for (const seuil of seuils) {
      const since = new Date()
      since.setDate(since.getDate() - seuil.periodejours)

      const whereCount: Record<string, unknown> = {
        maladieId: body.maladieId,
        createdAt: { gte: since },
        statut: { not: "infirme" },
      }
      if (seuil.perimetre === "commune" && seuil.communeId) {
        whereCount.communeId = seuil.communeId
      } else if (seuil.perimetre === "wilaya" && seuil.wilayadId) {
        // filter by wilaya via commune
      }

      const count = await prisma.casDeclare.count({ where: whereCount })

      if (count >= seuil.seuilNombre) {
        // Check not already triggered in this window
        const alreadyTriggered = await prisma.protocoleDeclenchement.findFirst({
          where: { seuilId: seuil.id, createdAt: { gte: since } },
        })

        if (!alreadyTriggered) {
          // Create alert
          const alerte = await prisma.alerte.create({
            data: {
              type: "seuil",
              titre: `Seuil dépassé — ${seuil.maladie.nom}`,
              description: `${count} cas de ${seuil.maladie.nom} en ${seuil.periodejours} jours (seuil: ${seuil.seuilNombre})`,
              maladieId: seuil.maladieId,
              nombreCas: count,
              statut: "active",
            },
          })

          // Find protocole for this maladie
          const protocole = await prisma.protocole.findUnique({
            where: { maladieId: body.maladieId },
          })

          if (protocole) {
            declenchement = await prisma.protocoleDeclenchement.create({
              data: {
                protocoleId: protocole.id,
                seuilId: seuil.id,
                alerteId: alerte.id,
                casDeclencheurId: cas.id,
                nombreCasActuel: count,
                communeId: cas.communeId ?? null,
                maladieId: body.maladieId,
              },
              include: { protocole: true, seuil: true },
            })
          }

          if (seuil.autoNotification) {
            const users = await prisma.user.findMany({
              where: { role: { in: ["epidemiologiste", "admin"] }, isActive: true },
              select: { id: true, email: true },
            })
            await prisma.notification.createMany({
              data: users.map(u => ({
                userId: u.id,
                type: "seuil_depasse",
                titre: `⚠️ Seuil dépassé — ${seuil.maladie.nom}`,
                message: `${count} cas en ${seuil.periodejours} jours (seuil: ${seuil.seuilNombre}) — Gravité: ${seuil.gravite}`,
              })),
            })
            const { sendAlertEmail } = await import("@/lib/email")
            sendAlertEmail(
              users.map(u => u.email),
              alerte.titre,
              alerte.description,
              alerte.type
            ).catch(console.error)
          }
          break // Only trigger once per case creation
        }
      }
    }

    // Fallback: legacy seuil_alerte on maladie if no seuils configured
    if (seuils.length === 0) {
      const maladie = await prisma.maladie.findUnique({ where: { id: body.maladieId } })
      if (maladie) {
        const since = new Date()
        since.setDate(since.getDate() - 30)
        const recentCount = await prisma.casDeclare.count({
          where: { maladieId: body.maladieId, createdAt: { gte: since } },
        })
        if (recentCount >= maladie.seuilAlerte) {
          const existingAlert = await prisma.alerte.findFirst({
            where: { maladieId: body.maladieId, statut: "active" },
          })
          if (!existingAlert) {
            await prisma.alerte.create({
              data: {
                type: "seuil",
                titre: `Seuil atteint — ${maladie.nom}`,
                description: `${recentCount} cas de ${maladie.nom} en 30 jours (seuil: ${maladie.seuilAlerte})`,
                maladieId: maladie.id,
                nombreCas: recentCount,
                statut: "active",
              },
            })
          }
        }
      }
    }

    return NextResponse.json({ ...cas, declenchement }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erreur création cas" }, { status: 500 })
  }
}
