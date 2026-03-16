"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, FilePlus, List, Search,
  BarChart, AlertTriangle, Users, Settings, LogOut, Menu, X, FileBarChart,
} from "lucide-react"
import { cn } from "@/utils/cn"
import { NAV_ITEMS } from "@/constants/navigation"
import { signOut } from "next-auth/react"

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, FilePlus, List, Search,
  BarChart, AlertTriangle, Users, Settings, FileBarChart,
}

interface SidebarProps {
  userRole: string
  userName: string
}

function NavLinks({
  visibleItems,
  pathname,
  onNavigate,
}: {
  visibleItems: typeof NAV_ITEMS
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3">
      <ul className="space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon]
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-white/15 text-white border-l-[3px] border-white pl-[9px]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {Icon && <Icon size={18} />}
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function SidebarLogo() {
  return (
    <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shrink-0">
        <span className="font-bold text-sm" style={{ color: "#1B4F8A" }}>EHU</span>
      </div>
      <div>
        <p className="text-white font-semibold text-sm leading-tight">EHU Oran</p>
        <p className="text-white/60 text-xs">Surveillance Épid.</p>
      </div>
    </div>
  )
}

function SidebarFooter({ userName, userRole }: { userName: string; userRole: string }) {
  return (
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{userName}</p>
          <p className="text-white/60 text-xs capitalize">{userRole}</p>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm transition-all"
      >
        <LogOut size={16} />
        <span>Déconnexion</span>
      </button>
    </div>
  )
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole as "medecin" | "epidemiologiste" | "admin")
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white shadow-lg"
        style={{ backgroundColor: "#1B4F8A" }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#1B4F8A" }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarLogo />
        <NavLinks visibleItems={visibleItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        <SidebarFooter userName={userName} userRole={userRole} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-30"
        style={{ backgroundColor: "#1B4F8A" }}
      >
        <SidebarLogo />
        <NavLinks visibleItems={visibleItems} pathname={pathname} />
        <SidebarFooter userName={userName} userRole={userRole} />
      </aside>
    </>
  )
}
