import { FileX } from "lucide-react"

interface Props {
  title?: string
  description?: string
}

export default function EmptyState({
  title = "Aucune donnée",
  description = "Il n'y a rien à afficher pour le moment."
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileX size={40} className="text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  )
}
