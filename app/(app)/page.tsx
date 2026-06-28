import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

const insights = [
  {
    title: "樂天・Amazon・Mercari 同步搜尋",
    market: "多平台",
    summary:
      "MarketTomo 現已同時搜尋三大日本電商平台，並以評論數排序，讓最具口碑的商品優先呈現。",
    tone: "新功能",
  },
  {
    title: "一鍵追蹤喜愛商品",
    market: "追蹤功能",
    summary:
      "在搜尋結果頁點擊商品卡右下角的 + 按鈕，即可將商品加入追蹤清單，方便日後比價或觀察趨勢。",
    tone: "已上線",
  },
  {
    title: "AI 關鍵字擴展",
    market: "AI 功能",
    summary:
      "搜尋完成後，AI 會自動建議相關關鍵字，幫助你發掘更多市場機會，點擊即可直接搜尋。",
    tone: "已上線",
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

      {/* Real-time stat cards from TrackingContext */}
      <DashboardStats />

      {/* Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">最新功能</h2>
          <Button variant="ghost" size="sm" render={<Link href="/search" />}>
            前往搜尋
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {insights.map((insight) => (
            <Card
              key={insight.title}
              className="transition-colors hover:border-primary/40"
            >
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
                <p className="text-sm text-muted-foreground">
                  {insight.summary}
                </p>
                <Badge variant="secondary">{insight.tone}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
