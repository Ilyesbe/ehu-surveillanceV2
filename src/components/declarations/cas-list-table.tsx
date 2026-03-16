"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react"
import CasStatusBadge from "./cas-status-badge"
import { formatDate } from "@/utils/format-date"
import { TableSkeleton } from "@/components/shared/skeleton"
import { toast } from "sonner"
import type { CasStatut } from "@/types"

interface Cas {
  id: string
  codeCas: string
  statut: CasStatut
  createdAt: string
  patient: { firstName: string; lastName: string }
  maladie: { nom: string }
  commune: { nom: string } | null
  medecin: { firstName: string; lastName: string } | null
}

interface CasResponse {
  cas: Cas[]
  total: number
  page: number
  totalPages: number
}

const STATUTS = ["", "nouveau", "en_cours", "confirme", "infirme", "cloture"]
const STATUT_LABELS: Record<string, string> = {
  "": "Tous les statuts", nouveau: "Nouveau", en_cours: "En cours",
  confirme: "Confirmé", infirme: "Infirmé", cloture: "Clôturé",
}

export default function CasListTable({ userRole }: { userRole: string }) {
  const [data, setData] = useState<CasResponse | null>(null)
  const [page, setPage] = useState(1)
  const [statut, setStatut] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchCas = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (statut) params.set("statut", statut)
      if (search) params.set("search", search)
      const res = await fetch(`/api/cas?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [page, statut, search])

  useEffect(() => { fetchCas() }, [fetchCas])

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce cas ?")) return
    const res = await fetch(`/api/cas/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Cas supprimé")
      fetchCas()
    } else {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b border-gray-100 flex gap-3">
        <input
          type="text"
          placeholder="Rechercher par patient ou code cas..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1B4F8A]"
        />
        <select
          value={statut}
          onChange={e => { setStatut(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#1B4F8A]"
        >
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#F5F6F7" }}>
              {["Code Cas", "Patient", "Maladie", "Commune", "Date", "Statut", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={7} />
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <AlertCircle size={28} className="text-red-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">Impossible de charger les déclarations</p>
                  <button onClick={fetchCas} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-600">
                    <RefreshCw size={13} /> Réessayer
                  </button>
                </td>
              </tr>
            ) : !data?.cas.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center">
                  <p className="text-sm text-gray-400">Aucun cas trouvé</p>
                </td>
              </tr>
            ) : (
              data.cas.map((cas, i) => (
                <tr key={cas.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"} style={{ borderBottom: "1px solid #EBEDEF" }}>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{cas.codeCas}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{cas.patient.firstName} {cas.patient.lastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cas.maladie.nom}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{cas.commune?.nom ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(cas.createdAt)}</td>
                  <td className="px-4 py-3"><CasStatusBadge statut={cas.statut} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/declarations/${cas.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors" title="Voir"><Eye size={15} /></Link>
                      <Link href={`/declarations/${cas.id}/edit`} className="p-1.5 rounded hover:bg-amber-50 text-amber-500 transition-colors" title="Éditer"><Pencil size={15} /></Link>
                      {userRole === "admin" && (
                        <button onClick={() => handleDelete(cas.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors" title="Supprimer"><Trash2 size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-50">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={28} className="text-red-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">Impossible de charger les déclarations</p>
            <button onClick={fetchCas} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600">
              <RefreshCw size={13} /> Réessayer
            </button>
          </div>
        ) : !data?.cas.length ? (
          <div className="p-8 text-center text-sm text-gray-400">Aucun cas trouvé</div>
        ) : (
          data.cas.map(cas => (
            <div key={cas.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{cas.codeCas}</span>
                    <CasStatusBadge statut={cas.statut} />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{cas.patient.firstName} {cas.patient.lastName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cas.maladie.nom} · {cas.commune?.nom ?? "—"} · {formatDate(cas.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/declarations/${cas.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-500" title="Voir"><Eye size={15} /></Link>
                  <Link href={`/declarations/${cas.id}/edit`} className="p-1.5 rounded hover:bg-amber-50 text-amber-500" title="Éditer"><Pencil size={15} /></Link>
                  {userRole === "admin" && (
                    <button onClick={() => handleDelete(cas.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Supprimer"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>{data.total} cas au total</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
            <span>Page {data.page} / {data.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
