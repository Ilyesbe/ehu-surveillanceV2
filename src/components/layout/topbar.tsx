"use client"

import { usePathname } from "next/navigation"
import NotificationBell from "@/components/notifications/notification-bell"

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/declarations": "Liste des Cas",
  "/declarations/new": "Nouvelle Déclaration",
  "/investigations": "Investigations",
  "/analyses": "Analyses & Statistiques",
  "/alertes": "Alertes",
  "/utilisateurs": "Utilisateurs",
  "/parametres": "Paramètres",
  "/profil": "Mon Profil",
}

interface TopbarProps {
  userName: string
}

export default function Topbar({ userName }: TopbarProps) {
  const pathname = usePathname()
  const title = BREADCRUMBS[pathname] ?? "EHU Surveillance"

  return (
    <header className="fixed top-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 left-0 lg:left-64">
      <h2 className="text-base font-semibold text-gray-800 pl-10 lg:pl-0">{title}</h2>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1B4F8A" }}>
          <span className="text-white text-xs font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
