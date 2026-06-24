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
  { name: "AI observability market", type: "Market", signals: 42, lastUpdate: "2h ago", status: "Alert" },
  { name: "Nimbus Analytics", type: "Competitor", signals: 18, lastUpdate: "5h ago", status: "Active" },
  { name: "EU data residency", type: "Regulation", signals: 7, lastUpdate: "1d ago", status: "Active" },
  { name: "Vertical SaaS pricing", type: "Trend", signals: 0, lastUpdate: "3d ago", status: "Paused" },
]

const statusVariant: Record<Status, "default" | "secondary" | "destructive"> = {
  Active: "secondary",
  Paused: "secondary",
  Alert: "destructive",
}

export default function TrackingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tracking"
        description="Monitor markets, competitors and signals you care about."
      >
        <Button size="lg">
          <Plus className="size-4" />
          Track new
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Active trackers</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Open alerts</CardDescription>
            <CardTitle className="text-3xl text-destructive">3</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Signals (7d)</CardDescription>
            <CardTitle className="text-3xl">318</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Radar className="size-4 text-primary" />
            Tracked items
          </CardTitle>
          <CardDescription>
            Everything MarketTomo is watching on your behalf.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Signals</TableHead>
                <TableHead>Last update</TableHead>
                <TableHead>Status</TableHead>
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
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
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
