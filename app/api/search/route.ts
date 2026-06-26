import { NextResponse, type NextRequest } from "next/server"

import { crawl } from "@/services/crawler"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const keyword =
    typeof body?.keyword === "string" ? body.keyword.trim() : ""

  if (!keyword) {
    return NextResponse.json(
      { success: false, error: "請輸入搜尋關鍵字。" },
      { status: 400 }
    )
  }

  try {
    // 所有搜尋結果都來自 searchRakuten()（透過 crawler registry）。
    const products = await crawl("rakuten", keyword)
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
