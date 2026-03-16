"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import DashboardFilters from "./dashboard-filters"
import EpidemicCurve from "./epidemic-curve"
import DiseaseDistribution from "./disease-distribution"
import StatCards from "./stat-cards"
import { DashboardSkeleton, Sk } from "@/components/shared/skeleton"
import { AlertCircle, RefreshCw } from "lucide-react"

// Dynamic import for map (no SSR)
const EpidemicMap = dynamic(() => import("@/components/maps/epidemic-map"), { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl"><p className="text-sm text-gray-400">Chargement de la carte...</p></div> })

interface Maladie { id: string; nom: string }
interface Commune { id: string; nom: string }

interface DashboardData {
  stats: { totalActifs: number; totalAlertes: number; totalMaladies: number }
  mapMarkers: Array<{ id: string; lat: number; lng: number; statut: string; maladie: string; commune: string; date: string }>
  epidemicCurve: Array<{ date: string; count: number }>
  diseaseDistribution: Array<{ name: string; count: number }>
}

interface Props {
  maladies: Maladie[]
  communes: Commune[]
  userName: string
}

export default function DashboardClient({ maladies, communes, userName }: Props) {
  const [filters, setFilters] = useState({ maladieId: "", communeId: "", days: "30" })
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`/api/stats/dashboard?${params}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tableau de Bord</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenue, {userName} — Surveillance épidémiologique en temps réel</p>
        </div>
        <DashboardFilters maladies={maladies} communes={communes} filters={filters} onChange={setFilters} />
      </div>

      {/* Full skeleton on initial load */}
      {loading && !data ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <AlertCircle size={36} className="text-red-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">Erreur de chargement</p>
          <p className="text-sm text-gray-400 mb-4">Impossible de récupérer les données du tableau de bord</p>
          <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <RefreshCw size={15} /> Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="mb-6">
            <StatCards stats={data!.stats} />
          </div>

          {/* Map + Disease Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Carte Épidémique — Wilaya d&apos;Oran</p>
              <div style={{ height: "320px" }}>
                <EpidemicMap markers={data!.mapMarkers} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Répartition par Maladie</p>
              {loading ? (
                <Sk w="100%" h={256} rounded={8} />
              ) : (
                <DiseaseDistribution data={data!.diseaseDistribution} />
              )}
            </div>
          </div>

          {/* Epidemic Curve */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Courbe Épidémique — {filters.days} derniers jours
            </p>
            {loading ? (
              <Sk w="100%" h={224} rounded={8} />
            ) : (
              <EpidemicCurve data={data!.epidemicCurve} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
