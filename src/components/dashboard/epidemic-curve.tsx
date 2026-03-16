"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DataPoint { date: string; count: number }

export default function EpidemicCurve({ data }: { data: DataPoint[] }) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EBEDEF" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8A909B" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: "#8A909B" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: "8px", border: "1px solid #EBEDEF", fontSize: "12px" }}
          formatter={(value) => [value, "Cas"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line type="monotone" dataKey="count" stroke="#1B4F8A" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#1B4F8A" }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
