"use client"

import * as React from "react"
import { ExternalLink, Trash2, PackageSearch } from "lucide-react"

import type { Product } from "@/lib/types"
import { useTracking } from "@/components/tracking-context"
import { PLATFORM_LABELS } from "@/lib/platforms"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
})

export function TrackingTable() {
  const { trackedIds, toggleTracking } = useTracking()
  // Load saved products from localStorage (stored alongside IDs)
  const [products, setProducts] = React.useState<Product[]>([])

  React.useEffect(() => {
    React.startTransition(() => {
      if (trackedIds.size === 0) {
        setProducts([])
        return
      }
      try {
        const raw = localStorage.getItem("markettomo:tracked-products")
        const arr: Product[] = raw ? JSON.parse(raw) : []
        setProducts(arr.filter((p) => trackedIds.has(p.id)))
      } catch {
        setProducts([])
      }
    })
  }, [trackedIds])

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <PackageSearch className="size-10 opacity-40" />
        <p className="text-sm">尚無追蹤商品。</p>
        <p className="text-xs opacity-60">
          前往搜尋頁面，點擊商品卡右下角的 + 按鈕即可加入追蹤。
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>商品</TableHead>
          <TableHead>平台</TableHead>
          <TableHead className="text-right">價格</TableHead>
          <TableHead>賣場</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="max-w-xs">
              <a
                href={product.itemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:underline"
              >
                {product.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.title}
                    className="size-10 shrink-0 rounded object-contain bg-white/5"
                  />
                )}
                <span className="line-clamp-2 text-sm font-medium">
                  {product.title}
                </span>
              </a>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {PLATFORM_LABELS[product.platform] ?? product.platform}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {yen.format(product.price)}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {product.shop}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <a
                  href={product.itemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="在新分頁開啟"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  type="button"
                  aria-label="移除追蹤"
                  onClick={() => {
                    toggleTracking(product)
                    // Remove from cached product list
                    try {
                      const raw = localStorage.getItem(
                        "markettomo:tracked-products",
                      )
                      const arr: Product[] = raw ? JSON.parse(raw) : []
                      localStorage.setItem(
                        "markettomo:tracked-products",
                        JSON.stringify(arr.filter((p) => p.id !== product.id)),
                      )
                    } catch {
                      // ignore
                    }
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/50 hover:border-destructive/40 hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
