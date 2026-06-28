import type { Metadata } from "next"
import { Radar } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrackingTable } from "@/components/tracking/tracking-table"
import { TrackingStats } from "@/components/tracking/tracking-stats"

export const metadata: Metadata = { title: "追蹤" }

export default function TrackingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="追蹤"
        description="監控你在搜尋頁面加入追蹤的商品。"
      />

      <TrackingStats />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Radar className="size-4 text-primary" />
            追蹤商品
          </CardTitle>
          <CardDescription>
            你目前正在追蹤的所有商品。點擊商品卡上的 + 號即可加入追蹤。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrackingTable />
        </CardContent>
      </Card>
    </div>
  )
}
