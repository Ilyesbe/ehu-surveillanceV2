import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import CasStatusBadge from "@/components/declarations/cas-status-badge"
import CasExportPdfButton from "@/components/declarations/cas-export-pdf-button"
import { formatDate } from "@/utils/format-date"
import { calculateAge } from "@/utils/calculate-age"
import type { CasStatut } from "@/types"
import CasStatusChanger from "@/components/declarations/cas-status-changer"

export default async function CasDetailPage({ params }: { params: Promise<{ casId: string }> }) {
  const { casId } = await params
  const session = await auth()

  const cas = await prisma.casDeclare.findUnique({
    where: { id: casId },
    include: {
      patient: { include: { commune: true } },
      maladie: true,
      commune: true,
      etablissement: true,
      medecin: { select: { firstName: true, lastName: true, email: true } },
      fichiers: true,
      investigation: {
        include: {
          contacts: true,
          epidemiologiste: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!cas) notFound()

  const age = calculateAge(cas.patient.dateOfBirth)
  const canChangeStatus = session?.user.role === "epidemiologiste" || session?.user.role === "admin"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/declarations" className="text-sm text-gray-400 hover:text-gray-600">← Retour</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold text-gray-800">{cas.codeCas}</h1>
          <CasStatusBadge statut={cas.statut as CasStatut} />
        </div>
        <div className="flex gap-2">
          {canChangeStatus && <CasStatusChanger casId={cas.id} currentStatut={cas.statut as CasStatut} />}
          <CasExportPdfButton cas={{
            codeCas: cas.codeCas,
            statut: cas.statut,
            maladie: cas.maladie.nom,
            codeMdo: cas.maladie.codeMdo,
            patient: {
              identifiant: cas.patient.identifiant,
              firstName: cas.patient.firstName,
              lastName: cas.patient.lastName,
              sex: cas.patient.sex,
              age,
              phone: cas.patient.phone ?? "—",
              address: cas.patient.address ?? "—",
              commune: cas.patient.commune?.nom ?? "—",
            },
            etablissement: cas.etablissement?.nom ?? "—",
            commune: cas.commune?.nom ?? "—",
            service: cas.service ?? "—",
            modeConfirmation: cas.modeConfirmation,
            dateDebutSymptomes: formatDate(cas.dateDebutSymptomes),
            dateDiagnostic: formatDate(cas.dateDiagnostic),
            dateDeclaration: formatDate(cas.createdAt),
            medecin: cas.medecin ? `Dr. ${cas.medecin.firstName} ${cas.medecin.lastName}` : "—",
            notesCliniques: cas.notesCliniques ?? undefined,
            resultatLabo: cas.resultatLabo ?? undefined,
          }} />
          <Link href={`/declarations/${cas.id}/edit`} className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Modifier
          </Link>
        </div>
      </div>

      {/* 2-col layout */}
      <div className="flex gap-5">
        {/* Patient Sidebar */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3" style={{ backgroundColor: "#1B4F8A" }}>
                {cas.patient.firstName[0]}{cas.patient.lastName[0]}
              </div>
              <p className="font-semibold text-gray-800">{cas.patient.firstName} {cas.patient.lastName}</p>
              <p className="text-sm text-gray-500">{age} ans • {cas.patient.sex}</p>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Identifiant", value: cas.patient.identifiant },
                { label: "Téléphone", value: cas.patient.phone ?? "—" },
                { label: "Commune", value: cas.patient.commune?.nom ?? "—" },
                { label: "Établissement", value: cas.etablissement?.nom ?? "—" },
                { label: "Maladie", value: cas.maladie.nom },
                { label: "Déclaré le", value: formatDate(cas.createdAt) },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400 text-xs font-medium">{item.label}</span>
                  <span className="text-gray-700 text-xs text-right max-w-[130px] truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content tabs */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {/* Tab headers */}
            <div className="flex border-b border-gray-100">
              {["Données Cliniques", "Résultats Labo", "Investigation"].map((tab, i) => (
                <span key={tab} className={`px-5 py-3 text-sm font-medium cursor-default ${i === 0 ? "border-b-2 text-[#1B4F8A]" : "text-gray-500"}`} style={i === 0 ? { borderBottomColor: "#1B4F8A" } : {}}>
                  {tab}
                </span>
              ))}
            </div>

            {/* Tab content — Données Cliniques */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Maladie", value: cas.maladie.nom },
                  { label: "Code MDO", value: cas.maladie.codeMdo },
                  { label: "Début Symptômes", value: formatDate(cas.dateDebutSymptomes) },
                  { label: "Date Diagnostic", value: formatDate(cas.dateDiagnostic) },
                  { label: "Mode Confirmation", value: cas.modeConfirmation },
                  { label: "Service", value: cas.service },
                  { label: "Médecin Déclarant", value: cas.medecin ? `Dr. ${cas.medecin.firstName} ${cas.medecin.lastName}` : "—" },
                  { label: "Statut", value: cas.statut },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 capitalize">{item.value}</p>
                  </div>
                ))}
                {cas.notesCliniques && (
                  <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Notes Cliniques</p>
                    <p className="text-sm text-gray-700">{cas.notesCliniques}</p>
                  </div>
                )}
              </div>

              {/* Patient address */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Adresse Patient</p>
                <p className="text-sm text-gray-700">{cas.patient.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
