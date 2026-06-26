import { getProvider } from "./registry"

function buildPrompt(keyword: string): string {
  return `あなたは日本のECサイト（楽天市場）向けの検索キーワード提案アシスタントです。
ユーザーの検索キーワードに対して、買い物客が実際に使う関連キーワードを4〜6個提案してください。
同義語、カタカナ・英語表記のゆれ、商品タイプのバリエーションを含めてください。
元のキーワードそのものは含めないでください。
出力は文字列のJSON配列のみ。説明やマークダウンは不要です。

例:
入力: "PC"
出力: ["ノートPC", "ラップトップ", "Windows PC", "Laptop"]

検索キーワード: "${keyword}"`
}

// Tolerant parse: handles raw JSON, ```json fences, or array embedded in prose.
function parseKeywordArray(text: string): string[] {
  let cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim()

  const start = cleaned.indexOf("[")
  const end = cleaned.lastIndexOf("]")
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1)
  }

  const parsed: unknown = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) return []
  return parsed
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Expand a search keyword into related Japanese-market keywords using the
 * configured LLM provider (Gemini by default). Throws if the provider fails or
 * the response can't be parsed — callers decide on the fallback.
 */
export async function expandKeywords(keyword: string): Promise<string[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const text = await getProvider().generate(buildPrompt(trimmed))
  const candidates = parseKeywordArray(text)

  // De-dupe case-insensitively, drop the original term, cap to 6.
  const seen = new Set<string>([trimmed.toLowerCase()])
  const result: string[] = []
  for (const k of candidates) {
    const key = k.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(k)
    if (result.length >= 6) break
  }
  return result
}
