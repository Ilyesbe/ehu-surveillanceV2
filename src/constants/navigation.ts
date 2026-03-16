import { Role } from "@/types"

export interface NavItem {
  label: string
  href: string
  icon: string
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["medecin", "epidemiologiste", "admin"] },
  { label: "Nouvelle Déclaration", href: "/declarations/new", icon: "FilePlus", roles: ["medecin", "epidemiologiste"] },
  { label: "Liste des Cas", href: "/declarations", icon: "List", roles: ["medecin", "epidemiologiste", "admin"] },
  { label: "Investigations", href: "/investigations", icon: "Search", roles: ["epidemiologiste", "admin"] },
  { label: "Analyses & Statistiques", href: "/analyses", icon: "BarChart", roles: ["epidemiologiste", "admin"] },
  { label: "Rapports", href: "/rapports", icon: "FileBarChart", roles: ["epidemiologiste", "admin"] },
  { label: "Alertes", href: "/alertes", icon: "AlertTriangle", roles: ["epidemiologiste", "admin"] },
  { label: "Utilisateurs", href: "/utilisateurs", icon: "Users", roles: ["admin"] },
  { label: "Paramètres", href: "/parametres", icon: "Settings", roles: ["admin", "epidemiologiste"] },
]
