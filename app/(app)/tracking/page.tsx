import type { Metadata } from "next"
import { Plus, Radar } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata: Metadata = { title: "Tracking" }

type Status = "Active" | "Paused" | "Alert"

const tracked: {
  name: string
  type: string
  signals: number
  lastUpdate: string
  status: Status
}[] = [
  { name: "AI 可觀測性市場", type: "市場", signals: 42, lastUpdate: "2 小時前", status: "Alert" },
  { name: "Nimbus Analytics", type: "競爭對手", signals: 18, lastUpdate: "5 小時前", status: "Active" },
  { name: "歐盟資料落地", type: "法規", signals: 7, lastUpdate: "1 天前", status: "Active" },
  { name: "垂直 SaaS 定價", type: "趨勢", signals: 0, lastUpdate: "3 天前", status: "Paused" },
]

const statusVariant: Record<Status, "default" | "secondary" | "destructive"> = {
  Active: "secondary",
  Paused: "secondary",
  Alert: "destructive",
}

const statusLabel: Record<Status, string> = {
  Active: "進行中",
  Paused: "已暫停",
  Alert: "警示",
}

export default function TrackingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="追蹤"
        description="監控你關注的市場、競爭對手與訊號。"
      >
        <Button size="lg">
          <Plus className="size-4" />
          新增追蹤
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>進行中的追蹤</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>未處理警示</CardDescription>
            <CardTitle className="text-3xl text-destructive">3</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>訊號（7 天）</CardDescription>
            <CardTitle className="text-3xl">318</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Radar className="size-4 text-primary" />
            追蹤項目
          </CardTitle>
          <CardDescription>
            MarketTomo 正在為你監看的所有項目。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>類型</TableHead>
                <TableHead className="text-right">訊號</TableHead>
                <TableHead>最後更新</TableHead>
                <TableHead>狀態</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracked.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.type}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.signals}</TableCell>
                  <TableCell className="text-muted-foreground">{item.lastUpdate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
