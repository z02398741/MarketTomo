"use client"

import { useTracking } from "@/components/tracking-context"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

export function TrackingStats() {
  const { trackedIds } = useTracking()
  const total = trackedIds.size

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>追蹤中的商品</CardDescription>
          <CardTitle className="text-3xl">{total}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>涵蓋平台</CardDescription>
          <CardTitle className="text-3xl">
            {total === 0 ? "0" : "3"}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>狀態</CardDescription>
          <CardTitle className="text-3xl text-emerald-500">
            {total > 0 ? "監看中" : "空閒"}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
