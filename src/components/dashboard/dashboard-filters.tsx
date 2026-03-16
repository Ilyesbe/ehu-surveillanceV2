"use client"

interface Maladie { id: string; nom: string }
interface Commune { id: string; nom: string }

interface Props {
  maladies: Maladie[]
  communes: Commune[]
  filters: { maladieId: string; communeId: string; days: string }
  onChange: (filters: { maladieId: string; communeId: string; days: string }) => void
}

export default function DashboardFilters({ maladies, communes, filters, onChange }: Props) {
  const select = "h-8 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#1B4F8A] bg-white"

  return (
    <div className="flex gap-3 flex-wrap">
      <select
        value={filters.days}
        onChange={e => onChange({ ...filters, days: e.target.value })}
        className={select}
      >
        <option value="7">7 derniers jours</option>
        <option value="30">30 derniers jours</option>
        <option value="90">90 derniers jours</option>
        <option value="365">12 derniers mois</option>
      </select>
      <select
        value={filters.maladieId}
        onChange={e => onChange({ ...filters, maladieId: e.target.value })}
        className={select}
      >
        <option value="">Toutes les maladies</option>
        {maladies.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
      </select>
      <select
        value={filters.communeId}
        onChange={e => onChange({ ...filters, communeId: e.target.value })}
        className={select}
      >
        <option value="">Toutes les communes</option>
        {communes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
      </select>
    </div>
  )
}
