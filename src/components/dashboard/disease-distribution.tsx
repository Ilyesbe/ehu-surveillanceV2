"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface DiseaseData { name: string; count: number }

const COLORS = ["#1B4F8A", "#3A7BD5", "#5499E8", "#8AB8F5", "#E74C3C", "#F39C12", "#27AE60", "#7C3AED"]

export default function DiseaseDistribution({ data }: { data: DiseaseData[] }) {
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-400">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEDEF" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#8A909B" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#4A5164" }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #EBEDEF", fontSize: "12px" }}
          formatter={(value) => [value, "Cas"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
