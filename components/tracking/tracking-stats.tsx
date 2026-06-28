"use client"

import * as React from "react"
import { useTracking } from "@/components/tracking-context"
import type { Product } from "@/lib/types"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

export function TrackingStats() {
  const { trackedIds } = useTracking()
  const total = trackedIds.size
  const [platformCount, setPlatformCount] = React.useState(0)

  React.useEffect(() => {
    React.startTransition(() => {
      if (total === 0) {
        setPlatformCount(0)
        return
      }
      try {
        const raw = localStorage.getItem("markettomo:tracked-products")
        const arr: Product[] = raw ? JSON.parse(raw) : []
        const platforms = new Set(
          arr.filter((p) => trackedIds.has(p.id)).map((p) => p.platform),
        )
        setPlatformCount(platforms.size)
      } catch {
        setPlatformCount(0)
      }
    })
  }, [trackedIds, total])

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
          <CardDescription>涵蓋平台數</CardDescription>
          <CardTitle className="text-3xl">{platformCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>狀態</CardDescription>
          <CardTitle
            className={[
              "text-3xl",
              total > 0 ? "text-emerald-500" : "",
            ].join(" ")}
          >
            {total > 0 ? "監看中" : "空閒"}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
