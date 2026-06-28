"use client"

import { Activity, Eye, Radar, TrendingUp } from "lucide-react"
import { useTracking } from "@/components/tracking-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const PLATFORM_COUNT = 3 // rakuten + amazon + mercari

export function DashboardStats() {
  const { trackedIds } = useTracking()
  const tracked = trackedIds.size

  const stats = [
    {
      label: "追蹤中的商品",
      value: tracked.toString(),
      delta: tracked > 0 ? `+${tracked}` : "—",
      icon: Radar,
    },
    {
      label: "支援平台",
      value: PLATFORM_COUNT.toString(),
      delta: "樂天・Amazon・Mercari",
      icon: Activity,
    },
    {
      label: "已追蹤（本週）",
      value: tracked.toString(),
      delta: tracked > 0 ? "活躍中" : "尚無資料",
      icon: Eye,
    },
    {
      label: "追蹤狀態",
      value: tracked > 0 ? "監看中" : "空閒",
      delta: `共 ${tracked} 項`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-3xl">{stat.value}</CardTitle>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary self-start [grid-area:1/2/3/3] justify-self-end">
              <stat.icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <Badge
              variant="secondary"
              className="text-emerald-600 dark:text-emerald-400"
            >
              {stat.delta}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
