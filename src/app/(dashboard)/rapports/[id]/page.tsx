"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts"
import { exportAnalysesPdf } from "@/utils/export-pdf"
import { exportAnalysesExcel } from "@/utils/export-excel"
import { FileText, FileSpreadsheet, ArrowLeft } from "lucide-react"

const COLORS = ["#1B4F8A", "#3A7BD5", "#E74C3C", "#F39C12", "#27AE60", "#7C3AED", "#5499E8", "#8AB8F5"]

const STATUT_LABELS: Record<string, string> = {
  nouveau: "Nouveau", en_cours: "En cours", confirme: "Confirmé", infirme: "Infirmé", cloture: "Clôturé",
}

export default function RapportDetailPage() {
  const { id } = useParams<{ id: string }>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rapport, setRapport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState<"pdf" | "excel" | null>(null)

  useEffect(() => {
    fetch(`/api/rapports/${id}`).then(r => r.json()).then(setRapport).finally(() => setLoading(false))
  }, [id])

  const handlePdf = async () => {
    setExportLoading("pdf")
    try {
      const period = `${new Date(rapport.dateDebut).toLocaleDateString("fr-FR")} — ${new Date(rapport.dateFin).toLocaleDateString("fr-FR")}`
      const d = rapport.donnees
      await exportAnalysesPdf({
        summary: d.summary,
        prevalence: d.casByMaladie?.map((r: { maladie: string; count: number }) => ({ name: r.maladie, count: r.count })) ?? [],
        weeklyTrend: d.weeklyTrend ?? [],
        ageDistribution: d.ageDistribution ?? [],
        sexDistribution: d.sexDistribution ?? [],
        statutDistribution: d.statutDistribution ?? [],
        period,
      })
    } finally { setExportLoading(null) }
  }

  const handleExcel = async () => {
    setExportLoading("excel")
    try {
      const period = `${new Date(rapport.dateDebut).toLocaleDateString("fr-FR")} — ${new Date(rapport.dateFin).toLocaleDateString("fr-FR")}`
      const d = rapport.donnees
      await exportAnalysesExcel({
        summary: d.summary,
        prevalence: d.casByMaladie?.map((r: { maladie: string; count: number }) => ({ name: r.maladie, count: r.count })) ?? [],
        weeklyTrend: d.weeklyTrend ?? [],
        ageDistribution: d.ageDistribution ?? [],
        sexDistribution: d.sexDistribution ?? [],
        statutDistribution: d.statutDistribution ?? [],
        period,
      })
    } finally { setExportLoading(null) }
  }

  if (loading) return <div className="text-sm text-gray-400 text-center py-20">Chargement du rapport...</div>
  if (!rapport || rapport.error) return <div className="text-sm text-red-400 text-center py-20">Rapport introuvable</div>

  const d = rapport.donnees

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/rapports" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{rapport.titre}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {new Date(rapport.dateDebut).toLocaleDateString("fr-FR")} → {new Date(rapport.dateFin).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePdf} disabled={exportLoading !== null} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60">
            <FileText size={14} className="text-red-500" />
            {exportLoading === "pdf" ? "Génération..." : "PDF"}
          </button>
          <button onClick={handleExcel} disabled={exportLoading !== null} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60">
            <FileSpreadsheet size={14} className="text-green-600" />
            {exportLoading === "excel" ? "Génération..." : "Excel"}
          </button>
        </div>
      </div>

      {/* Service filter badge */}
      {d.summary?.serviceFiltre && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtré par service :</span>
          <span className="text-xs font-medium bg-blue-50 text-[#1B4F8A] px-3 py-1 rounded-full border border-blue-100">
            {d.summary.serviceFiltre}
          </span>
        </div>
      )}

      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Cas", value: d.summary?.total ?? 0, color: "#1B4F8A" },
          { label: "Cas Confirmés", value: d.summary?.confirmes ?? 0, color: "#27AE60" },
          { label: "Alertes", value: d.summary?.alertes ?? 0, color: "#F39C12" },
          { label: "Investigations", value: d.summary?.investigations ?? 0, color: "#E74C3C" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{card.label}</p>
            <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Cas par maladie */}
        {d.casByMaladie?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Cas par Maladie</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={d.casByMaladie} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEDEF" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="maladie" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {d.casByMaladie.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly trend */}
        {d.weeklyTrend?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Tendance Hebdomadaire</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={d.weeklyTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEDEF" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#1B4F8A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Cas par service */}
      {d.casByService?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Cas par Service</p>
          <ResponsiveContainer width="100%" height={Math.max(180, d.casByService.length * 36)}>
            <BarChart data={d.casByService} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBEDEF" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="service" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={160} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {d.casByService.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Age distribution */}
        {d.ageDistribution?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Répartition par Âge</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={d.ageDistribution} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEDEF" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" fill="#1B4F8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status distribution */}
        {d.statutDistribution?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Répartition par Statut</p>
            <div className="space-y-2 mt-2">
              {d.statutDistribution.map((s: { name: string; count: number }, i: number) => {
                const total = d.statutDistribution.reduce((a: number, b: { count: number }) => a + b.count, 0)
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{STATUT_LABELS[s.name] ?? s.name}</span>
                      <span className="font-medium">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
