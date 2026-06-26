import type { Product } from "@/lib/types"

// MarketTomo crawls the public Rakuten Ichiba search results page instead of
// the (credential-gated) Rakuten API. The results page embeds a schema.org
// JSON-LD `ItemList`, which is far more stable than the obfuscated HTML classes.
const SEARCH_BASE = "https://search.rakuten.co.jp/search/mall"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "ja,en;q=0.8",
  Accept: "text/html,application/xhtml+xml",
}

export class CrawlerError extends Error {}

// Minimal shape of a schema.org Product node inside the JSON-LD ItemList.
interface JsonLdProduct {
  "@type"?: string
  name?: string
  image?: string | string[]
  url?: string
  offers?: { price?: number | string }
  aggregateRating?: { ratingValue?: number | string; reviewCount?: number | string }
}

// An ItemList entry is a Product node, sometimes nested under `.item`.
type JsonLdListEntry = JsonLdProduct & { item?: JsonLdProduct }

interface JsonLdItemList {
  "@type"?: string
  itemListElement?: JsonLdListEntry[]
}

// "https://item.rakuten.co.jp/<shop>/<code>/" -> shop = "<shop>"
function shopFromUrl(url: string): string {
  return url.match(/item\.rakuten\.co\.jp\/([^/]+)\//)?.[1] ?? ""
}

// Stable-ish id from the shop + item code in the URL path.
function idFromUrl(url: string, fallback: string): string {
  const match = url.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?]+)/)
  return match ? `rakuten:${match[1]}:${match[2]}` : `rakuten:${fallback}`
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

// Pull every <script type="application/ld+json"> block out of the HTML.
function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = []
  const regex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1].trim()))
    } catch {
      // Skip malformed blocks rather than failing the whole crawl.
    }
  }
  return blocks
}

function findItemList(blocks: unknown[]): JsonLdItemList | null {
  for (const block of blocks) {
    const candidates = Array.isArray(block)
      ? block
      : [block, ...((block as { "@graph"?: unknown[] })?.["@graph"] ?? [])]
    for (const node of candidates) {
      if ((node as JsonLdItemList)?.["@type"] === "ItemList") {
        return node as JsonLdItemList
      }
    }
  }
  return null
}

function toProduct(node: JsonLdListEntry, index: number): Product | null {
  const data = node.item ?? node
  const url = (data.url ?? "").split("?")[0]
  const title = data.name?.trim()
  if (!title || !url) return null

  const image = Array.isArray(data.image) ? data.image[0] : data.image ?? ""

  return {
    id: idFromUrl(url, String(index)),
    title,
    price: toNumber(data.offers?.price),
    image,
    shop: shopFromUrl(url),
    reviewCount: toNumber(data.aggregateRating?.reviewCount),
    reviewAverage: toNumber(data.aggregateRating?.ratingValue),
    itemUrl: url,
    platform: "rakuten",
  }
}

/**
 * Search Rakuten Ichiba for `keyword` and return normalized products.
 * Throws {@link CrawlerError} when the page can't be fetched or parsed.
 */
export async function searchRakuten(keyword: string): Promise<Product[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const url = `${SEARCH_BASE}/${encodeURIComponent(trimmed)}/`

  let html: string
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, cache: "no-store" })
    if (!res.ok) {
      throw new CrawlerError(`Rakuten search responded with ${res.status}`)
    }
    html = await res.text()
  } catch (error) {
    if (error instanceof CrawlerError) throw error
    throw new CrawlerError("Failed to fetch Rakuten search page")
  }

  const itemList = findItemList(extractJsonLdBlocks(html))
  if (!itemList?.itemListElement) {
    throw new CrawlerError("No product data found on Rakuten search page")
  }

  return itemList.itemListElement
    .map((node, i) => toProduct(node, i))
    .filter((p): p is Product => p !== null)
}
