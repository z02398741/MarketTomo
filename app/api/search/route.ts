import { NextResponse, type NextRequest } from "next/server"

import { crawl, activePlatforms } from "@/services/crawler"
import type { Platform, Product } from "@/lib/types"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const keyword =
    typeof body?.keyword === "string" ? body.keyword.trim() : ""
  const platformParam: string | undefined =
    typeof body?.platform === "string" ? body.platform : undefined

  if (!keyword) {
    return NextResponse.json(
      { success: false, error: "請輸入搜尋關鍵字。" },
      { status: 400 }
    )
  }

  // Determine which platforms to search
  const platforms: Platform[] = platformParam
    ? activePlatforms.filter((p) => p === platformParam)
    : activePlatforms

  try {
    // Search all active platforms in parallel; individual failures return []
    const results = await Promise.allSettled(
      platforms.map((p) => crawl(p, keyword))
    )

    const products: Product[] = results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      // Dedupe by product id (shouldn't happen across platforms, but be safe)
      .filter((p, i, arr) => arr.findIndex((q) => q.id === p.id) === i)
      // Sort by review count descending so well-reviewed items appear first
      .sort((a, b) => b.reviewCount - a.reviewCount)

    return NextResponse.json({
      success: true,
      total: products.length,
      products,
    })
  } catch (error) {
    console.error("[/api/search] crawl failed:", error)
    return NextResponse.json(
      { success: false, error: "搜尋失敗，請稍後再試。" },
      { status: 502 }
    )
  }
}
