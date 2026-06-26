import Link from "next/link"
import { ArrowUpRight, Activity, Eye, Radar, TrendingUp } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  { label: "追蹤中的市場", value: "24", delta: "+3", icon: Radar },
  { label: "本週訊號", value: "318", delta: "+12%", icon: Activity },
  { label: "監看的競爭對手", value: "57", delta: "+5", icon: Eye },
  { label: "趨勢分數", value: "82", delta: "+4 分", icon: TrendingUp },
]

const insights = [
  {
    title: "AI 基礎設施支出加速成長",
    market: "雲端與運算",
    summary:
      "企業 GPU 需求連續第三季供不應求，定價主導權正轉向現有大廠。",
    tone: "機會",
  },
  {
    title: "垂直 SaaS 分析市場出現新進者",
    market: "B2B SaaS",
    summary:
      "一家資金充裕的新創推出競品，鎖定你的中端市場客群。",
    tone: "觀察",
  },
  {
    title: "資料落地法規出現變動",
    market: "法規遵循",
    summary:
      "即將上路的歐盟規範可能影響你兩個追蹤市場的進入時機。",
    tone: "風險",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="儀表板"
        description="一眼掌握你的 AI 市場研究。"
      >
        <Button variant="outline" size="lg" render={<Link href="/tracking" />}>
          查看追蹤
        </Button>
        <Button size="lg" render={<Link href="/search" />}>
          開始研究
        </Button>
      </PageHeader>

      {/* Stat cards */}
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
              <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400">
                {stat.delta}
              </Badge>
              <span className="ml-2 text-xs text-muted-foreground">
                較上週
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">最新洞察</h2>
          <Button variant="ghost" size="sm" render={<Link href="/search" />}>
            查看全部
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {insights.map((insight) => (
            <Card key={insight.title} className="transition-colors hover:border-primary/40">
              <CardHeader>
                <Badge
                  variant="outline"
                  className="w-fit border-primary/30 text-primary"
                >
                  {insight.market}
                </Badge>
                <CardTitle className="text-base leading-snug">
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{insight.summary}</p>
                <Badge variant="secondary">{insight.tone}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
