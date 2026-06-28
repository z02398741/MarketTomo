import type { Product } from "@/lib/types"

// Mercari Japan search — parses the Next.js __NEXT_DATA__ blob embedded in
// the HTML of jp.mercari.com search results.
const SEARCH_BASE = "https://jp.mercari.com/search"

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

// Mercari item shapes seen in __NEXT_DATA__ across different page versions.
interface MercariItem {
  id?: string
  itemId?: string
  name?: string
  price?: number | string
  thumbnails?: string[]
  thumbnail?: string
  itemStatus?: string
  status?: string
  // seller / shop
  seller?: { name?: string }
  sellerName?: string
  // ratings (rarely in search results)
  reviewCount?: number
  reviewAverage?: number
}

function itemToProduct(item: MercariItem): Product | null {
  const id = item.id ?? item.itemId
  const title = item.name?.trim()
  if (!id || !title) return null

  // Skip sold items
  const status = item.itemStatus ?? item.status ?? ""
  if (status === "SOLD_OUT" || status === "sold_out" || status === "trading")
    return null

  const price = toNumber(item.price)
  const image =
    (Array.isArray(item.thumbnails) ? item.thumbnails[0] : item.thumbnail) ??
    ""
  const shop = item.seller?.name ?? item.sellerName ?? ""

  return {
    id: `mercari:${id}`,
    title,
    price,
    image,
    shop,
    reviewCount: toNumber(item.reviewCount),
    reviewAverage: toNumber(item.reviewAverage),
    itemUrl: `https://jp.mercari.com/item/${id}`,
    platform: "mercari",
  }
}

// Walk an arbitrary JSON object/array looking for arrays that contain Mercari
// item objects (identified by having both `id`/`itemId` and `name` fields).
function findItems(node: unknown, depth = 0): MercariItem[] {
  if (depth > 8 || !node || typeof node !== "object") return []
  if (Array.isArray(node)) {
    // If this looks like a list of items, return it
    const sample = node[0]
    if (
      sample &&
      typeof sample === "object" &&
      ("id" in sample || "itemId" in sample) &&
      "name" in sample
    ) {
      return node as MercariItem[]
    }
    // Otherwise recurse
    for (const child of node) {
      const found = findItems(child, depth + 1)
      if (found.length > 0) return found
    }
    return []
  }
  // Plain object — recurse into all values
  for (const value of Object.values(node as Record<string, unknown>)) {
    const found = findItems(value, depth + 1)
    if (found.length > 0) return found
  }
  return []
}

function extractNextData(html: string): unknown {
  const m = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html)
  if (!m) return null
  try {
    return JSON.parse(m[1])
  } catch {
    return null
  }
}

export async function searchMercari(keyword: string): Promise<Product[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const url = `${SEARCH_BASE}?keyword=${encodeURIComponent(trimmed)}&status=on_sale&sort=num_likes&order=desc`

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

  const nextData = extractNextData(html)
  if (!nextData) return []

  const rawItems = findItems(nextData)
  return rawItems
    .map(itemToProduct)
    .filter((p): p is Product => p !== null)
    .slice(0, 40)
}
