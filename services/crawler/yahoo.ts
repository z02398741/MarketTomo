import type { Product } from "@/lib/types"

// Yahoo!ショッピング search — scrapes shopping.yahoo.co.jp search results.
// Parses embedded JSON-LD ItemList or falls back to HTML patterns.
const SEARCH_BASE = "https://shopping.yahoo.co.jp/search"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
  Accept: "text/html,application/xhtml+xml",
}

function toNumber(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// --- JSON-LD parsing (same approach as Rakuten) ---

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = []
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1].trim()))
    } catch {
      // skip
    }
  }
  return blocks
}

interface JsonLdProduct {
  "@type"?: string
  name?: string
  image?: string | string[]
  url?: string
  offers?: { price?: number | string }
  aggregateRating?: {
    ratingValue?: number | string
    reviewCount?: number | string
  }
  seller?: { name?: string }
}

type JsonLdListEntry = JsonLdProduct & { item?: JsonLdProduct }

interface JsonLdItemList {
  "@type"?: string
  itemListElement?: JsonLdListEntry[]
}

function findItemList(blocks: unknown[]): JsonLdItemList | null {
  for (const block of blocks) {
    const candidates = Array.isArray(block)
      ? block
      : [block, ...((block as { "@graph"?: unknown[] })?.["@graph"] ?? [])]
    for (const node of candidates) {
      if ((node as JsonLdItemList)?.["@type"] === "ItemList")
        return node as JsonLdItemList
    }
  }
  return null
}

function entryToProduct(node: JsonLdListEntry, index: number): Product | null {
  const data = node.item ?? node
  const url = (data.url ?? "").split("?")[0]
  const title = data.name?.trim()
  if (!title || !url) return null

  const image = Array.isArray(data.image) ? data.image[0] : (data.image ?? "")

  // Extract a stable id from the URL path: /products/{id} or /product/{id}
  const idM = /\/product[s]?\/([^/?]+)/.exec(url)
  const id = idM ? `yahoo:${idM[1]}` : `yahoo:idx${index}`

  return {
    id,
    title,
    price: toNumber(data.offers?.price),
    image,
    shop: data.seller?.name ?? "",
    reviewCount: toNumber(data.aggregateRating?.reviewCount),
    reviewAverage: toNumber(data.aggregateRating?.ratingValue),
    itemUrl: url,
    platform: "yahoo",
  }
}

// --- __NEXT_DATA__ / embedded JSON fallback ---

interface YahooItem {
  id?: string
  name?: string
  priceLabel?: { defaultPrice?: number }
  price?: number
  image?: { medium?: string } | string
  store?: { name?: string }
  review?: { count?: number; rate?: number }
  url?: string
  externalUrl?: string
}

function findYahooItems(node: unknown, depth = 0): YahooItem[] {
  if (depth > 8 || !node || typeof node !== "object") return []
  if (Array.isArray(node)) {
    const sample = node[0]
    if (
      sample &&
      typeof sample === "object" &&
      ("name" in sample || "id" in sample) &&
      ("price" in sample ||
        "priceLabel" in sample ||
        "externalUrl" in sample ||
        "url" in sample)
    ) {
      return node as YahooItem[]
    }
    for (const child of node) {
      const found = findYahooItems(child, depth + 1)
      if (found.length > 0) return found
    }
    return []
  }
  for (const value of Object.values(node as Record<string, unknown>)) {
    const found = findYahooItems(value, depth + 1)
    if (found.length > 0) return found
  }
  return []
}

function yahooItemToProduct(item: YahooItem, index: number): Product | null {
  const title = item.name?.trim()
  if (!title) return null

  const price =
    item.price ??
    item.priceLabel?.defaultPrice ??
    0

  const image =
    typeof item.image === "string"
      ? item.image
      : (item.image?.medium ?? "")

  const url = item.externalUrl ?? item.url ?? ""
  const idM = url ? /\/product[s]?\/([^/?]+)/.exec(url) : null
  const id = idM
    ? `yahoo:${idM[1]}`
    : item.id
      ? `yahoo:${item.id}`
      : `yahoo:idx${index}`

  return {
    id,
    title,
    price: toNumber(price),
    image,
    shop: item.store?.name ?? "",
    reviewCount: toNumber(item.review?.count),
    reviewAverage: toNumber(item.review?.rate),
    itemUrl: url || `https://shopping.yahoo.co.jp/search?p=${encodeURIComponent(title)}`,
    platform: "yahoo",
  }
}

export async function searchYahoo(keyword: string): Promise<Product[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const url = `${SEARCH_BASE}?p=${encodeURIComponent(trimmed)}&sort=-score&X=0`

  let html: string
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      cache: "no-store",
      redirect: "follow",
    })
    if (!res.ok) return []
    html = await res.text()
  } catch {
    return []
  }

  // 1. Try JSON-LD ItemList (most reliable)
  const blocks = extractJsonLdBlocks(html)
  const itemList = findItemList(blocks)
  if (itemList?.itemListElement && itemList.itemListElement.length > 0) {
    const products = itemList.itemListElement
      .map((node, i) => entryToProduct(node, i))
      .filter((p): p is Product => p !== null)
    if (products.length > 0) return products
  }

  // 2. Try __NEXT_DATA__ embedded JSON
  const nextDataM =
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html)
  if (nextDataM) {
    try {
      const nextData = JSON.parse(nextDataM[1])
      const rawItems = findYahooItems(nextData)
      const products = rawItems
        .map((item, i) => yahooItemToProduct(item, i))
        .filter((p): p is Product => p !== null)
        .slice(0, 40)
      if (products.length > 0) return products
    } catch {
      // fall through
    }
  }

  // 3. Try other embedded JSON blobs (window.__STATE__ etc.)
  const stateM = /window\.__(?:STATE|DATA|INITIAL_STATE)__\s*=\s*(\{[\s\S]*?\});/.exec(html)
  if (stateM) {
    try {
      const stateData = JSON.parse(stateM[1])
      const rawItems = findYahooItems(stateData)
      const products = rawItems
        .map((item, i) => yahooItemToProduct(item, i))
        .filter((p): p is Product => p !== null)
        .slice(0, 40)
      if (products.length > 0) return products
    } catch {
      // fall through
    }
  }

  return []
}
