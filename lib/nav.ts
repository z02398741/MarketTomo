import { LayoutDashboard, Search, Radar, Settings, type LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview of your market research",
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
    description: "Explore markets, competitors and trends",
  },
  {
    title: "Tracking",
    href: "/tracking",
    icon: Radar,
    description: "Monitor signals and saved queries",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Workspace and account preferences",
  },
]
