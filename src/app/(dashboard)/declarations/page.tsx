import { auth } from "@/lib/auth"
import Link from "next/link"
import CasListTable from "@/components/declarations/cas-list-table"
import ExportButton from "@/components/shared/export-button"

export default async function DeclarationsPage() {
  const session = await auth()
  const userRole = session?.user.role ?? "medecin"
  const canExport = ["epidemiologiste", "admin"].includes(userRole)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Liste des Cas</h1>
          <p className="text-sm text-gray-500 mt-1">Cas déclarés dans le système</p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <>
              <ExportButton format="excel" type="cas" days={90} label="Excel" />
              <ExportButton format="csv" type="cas" days={90} label="CSV" />
            </>
          )}
          {["medecin", "epidemiologiste", "admin"].includes(userRole) && (
            <Link href="/declarations/new" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ backgroundColor: "#1B4F8A" }}>
              + Nouvelle Déclaration
            </Link>
          )}
        </div>
      </div>
      <CasListTable userRole={userRole} />
    </div>
  )
}
