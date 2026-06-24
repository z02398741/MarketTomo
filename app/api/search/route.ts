import { NextResponse, type NextRequest } from "next/server"

import { searchRakuten } from "@/lib/rakuten"
import type { Product, SearchStats } from "@/lib/types"

function computeStats(products: Product[]): SearchStats {
  if (products.length === 0) {
    return { count: 0, averagePrice: 0, minPrice: 0, maxPrice: 0 }
  }

  const prices = products.map((p) => p.price)
  const total = prices.reduce((sum, price) => sum + price, 0)

  return {
    count: products.length,
    averagePrice: Math.round(total / products.length),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  }
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword")?.trim()

  if (!keyword) {
    return NextResponse.json(
      { error: "請輸入搜尋關鍵字。" },
      { status: 400 }
    )
  }

  try {
    const products = await searchRakuten(keyword)
    return NextResponse.json({
      keyword,
      products,
      stats: computeStats(products),
    })
  } catch (error) {
    // Log the real cause server-side; show a friendly message to the user.
    console.error("[/api/search] Rakuten search failed:", error)
    return NextResponse.json(
      { error: "搜尋失敗，請稍後再試。" },
      { status: 502 }
    )
  }
}
