"use client"

import { useEffect, useRef, useState } from "react"
import { Activity, Shield, AlertTriangle, TrendingUp } from "lucide-react"

interface Stats {
  totalActifs: number
  totalAlertes: number
  totalMaladies: number
}

function useCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return value
}

function StatCard({
  label,
  value,
  sub,
  color,
  bgColor,
  icon: Icon,
  delay = 0,
  alert = false,
}: {
  label: string
  value: number | string
  sub: string
  color: string
  bgColor: string
  icon: React.ElementType
  delay?: number
  alert?: boolean
}) {
  const numericValue = typeof value === "number" ? value : 0
  const animated = useCounter(numericValue)
  const display = typeof value === "string" ? value : animated

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-hover relative overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bgColor }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>

      <p className="text-3xl font-bold counter-in" style={{ color }}>
        {display}
        {alert && numericValue > 0 && (
          <span className="ml-2 inline-flex w-2 h-2 rounded-full badge-pulse align-middle mb-1" style={{ backgroundColor: color }} />
        )}
      </p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

export default function StatCards({ stats }: { stats: Stats }) {
  const surveillanceScore = stats.totalActifs > 0
    ? Math.min(100, Math.round(((stats.totalActifs - stats.totalAlertes) / Math.max(stats.totalActifs, 1)) * 100))
    : 100

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Cas Actifs"
        value={stats.totalActifs}
        sub="nouveau + en cours + confirmé"
        color="#1B4F8A"
        bgColor="#EEF4FF"
        icon={Activity}
        delay={0}
      />
      <StatCard
        label="Maladies MDO"
        value={stats.totalMaladies}
        sub="sous surveillance active"
        color="#7C3AED"
        bgColor="#F3EEFF"
        icon={Shield}
        delay={60}
      />
      <StatCard
        label="Alertes Actives"
        value={stats.totalAlertes}
        sub={stats.totalAlertes > 0 ? "en attente de résolution" : "aucune alerte active"}
        color={stats.totalAlertes > 0 ? "#DC2626" : "#059669"}
        bgColor={stats.totalAlertes > 0 ? "#FEF2F2" : "#ECFDF5"}
        icon={AlertTriangle}
        delay={120}
        alert
      />
      <StatCard
        label="Score Surveillance"
        value={`${surveillanceScore}%`}
        sub="indice de couverture global"
        color="#059669"
        bgColor="#ECFDF5"
        icon={TrendingUp}
        delay={180}
      />
    </div>
  )
}
