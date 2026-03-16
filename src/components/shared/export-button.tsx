"use client"

import { useState } from "react"
import { Download, FileSpreadsheet } from "lucide-react"
import { exportCasExcel } from "@/utils/export-excel"

interface Props {
  format?: "csv" | "excel"
  type?: string
  days?: number
  label?: string
}

export default function ExportButton({ format = "csv", type = "cas", days = 30, label }: Props) {
  const [loading, setLoading] = useState(false)

  const defaultLabel = format === "excel" ? "Excel" : "CSV"

  const handleExport = async () => {
    setLoading(true)
    try {
      if (format === "excel") {
        // Fetch the JSON data, then generate Excel client-side
        const res = await fetch(`/api/export?format=json&type=${type}&days=${days}`)
        const rows = await res.json()
        await exportCasExcel(rows)
      } else {
        // CSV — fetch as blob and download
        const res = await fetch(`/api/export?format=csv&type=${type}&days=${days}`)
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `export-${type}-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } finally {
      setLoading(false)
    }
  }

  const Icon = format === "excel" ? FileSpreadsheet : Download
  const iconColor = format === "excel" ? "text-green-600" : "text-gray-500"

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      <Icon size={15} className={iconColor} />
      {loading ? "Export..." : (label ?? defaultLabel)}
    </button>
  )
}
