import { CAS_STATUTS } from "@/constants/statuts"
import type { CasStatut } from "@/types"

export default function CasStatusBadge({ statut }: { statut: CasStatut }) {
  const config = CAS_STATUTS[statut]
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ backgroundColor: config.bg, color: config.color, borderColor: config.border }}
    >
      {config.label}
    </span>
  )
}
