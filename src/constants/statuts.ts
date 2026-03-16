import { CasStatut } from "@/types"

export const CAS_STATUTS: Record<CasStatut, { label: string; color: string; bg: string; border: string }> = {
  nouveau: {
    label: "Nouveau",
    color: "#1B4F8A",
    bg: "#EEF4FF",
    border: "#C5DAFC",
  },
  en_cours: {
    label: "En cours",
    color: "#B45309",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  confirme: {
    label: "Confirmé",
    color: "#B91C1C",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  infirme: {
    label: "Infirmé",
    color: "#047857",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  cloture: {
    label: "Clôturé",
    color: "#4A5164",
    bg: "#F5F6F7",
    border: "#D5D8DC",
  },
}
