import { NextResponse, type NextRequest } from "next/server"

import { expandKeywords } from "@/services/ai/keywords"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const keyword =
    typeof body?.keyword === "string" ? body.keyword.trim() : ""

  if (!keyword) {
    return NextResponse.json({ keywords: [] }, { status: 400 })
  }

  try {
    const keywords = await expandKeywords(keyword)
    // 若 AI 沒有產生任何建議，至少回傳原始關鍵字。
    return NextResponse.json({ keywords: keywords.length ? keywords : [keyword] })
  } catch (error) {
    // AI 失敗 → 回傳原始關鍵字，不阻塞搜尋流程。
    console.error("[/api/keywords] expansion failed:", error)
    return NextResponse.json({ keywords: [keyword] })
  }
}
