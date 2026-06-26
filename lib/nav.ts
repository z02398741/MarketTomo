import { LayoutDashboard, Search, Radar, Settings, type LucideIcon } from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  description: string
}

export const navItems: NavItem[] = [
  {
    title: "儀表板",
    href: "/",
    icon: LayoutDashboard,
    description: "市場研究總覽",
  },
  {
    title: "搜尋",
    href: "/search",
    icon: Search,
    description: "探索市場、競爭對手與趨勢",
  },
  {
    title: "追蹤",
    href: "/tracking",
    icon: Radar,
    description: "監控訊號與已儲存的查詢",
  },
  {
    title: "設定",
    href: "/settings",
    icon: Settings,
    description: "工作區與帳號偏好設定",
  },
]
