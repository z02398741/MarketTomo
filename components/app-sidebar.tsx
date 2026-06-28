"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { navItems } from "@/lib/nav"
import { loadSearchStats, getMonthlyLimit } from "@/lib/search-stats"
import { Button } from "@/components/ui/button"

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const [searchCount, setSearchCount] = React.useState(0)
  const limit = getMonthlyLimit()

  // Read search count from localStorage after mount
  React.useEffect(() => {
    React.startTransition(() => setSearchCount(loadSearchStats().count))
  }, [pathname]) // re-read on every navigation so count stays fresh

  const usedPct = Math.min(100, Math.round((searchCount / limit) * 100))

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
          <Sparkles className="size-5" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">
            MarketTomo
          </span>
          <span className="text-[11px] text-muted-foreground">
            AI 市場研究夥伴
          </span>
        </div>
        {onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            aria-label="關閉選單"
            onClick={onNavigate}
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          工作區
        </p>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "size-4.5 shrink-0 transition-colors",
                  active
                    ? "text-sidebar-primary"
                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                )}
              />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Search quota footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-sidebar-accent/50 p-3">
          <p className="text-xs font-medium">本月搜尋額度</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            已使用 {searchCount.toLocaleString()} / {limit.toLocaleString()}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border">
            <div
              className="h-full rounded-full bg-sidebar-primary transition-all duration-500"
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
