import type { Product } from "@/lib/types"

// Amazon.co.jp uses aggressive bot detection; this is a best-effort scraper.
// It returns an empty array (rather than throwing) when Amazon blocks the request
// or when the page structure can't be parsed.
const SEARCH_BASE = "https://www.amazon.co.jp/s"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
}

function toNumber(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// Extract all <script type="application/ld+json"> blocks from HTML.
function extractJsonLd(html: string): unknown[] {
  const blocks: unknown[] = []
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1].trim()))
    } catch {
      // skip malformed
    }
  }
  return blocks
}

// Build an Amazon product URL from an ASIN.
function asinUrl(asin: string): string {
  return `https://www.amazon.co.jp/dp/${asin}`
}

// --- HTML parsing helpers (regex-based, Amazon structure) ---

interface RawItem {
  asin: string
  title: string
  price: number
  image: string
  reviewAverage: number
  reviewCount: number
}

// Pull the list of ASIN tokens from the page — each search result card has
// data-asin="ASIN" on the outermost element.
function parseAsinBlocks(html: string): RawItem[] {
  const items: RawItem[] = []
  // Match every search result container
  const blockRe =
    /data-component-type="s-search-result"[^>]*data-asin="([A-Z0-9]{10})"/g
  let m: RegExpExecArray | null

  while ((m = blockRe.exec(html)) !== null) {
    const asin = m[1]
    // Slice a ~4000-char window starting just after the match to parse the card
    const start = m.index
    const chunk = html.slice(start, start + 4000)

    // Title — usually inside <h2 …><a …><span>…</span>
    const titleM = /<h2[^>]*>[\s\S]*?<span[^>]*>([^<]{5,300})<\/span>/.exec(
      chunk,
    )
    const title = titleM ? titleM[1].trim() : ""
    if (!title) continue

    // Offscreen price (screen-reader text): "￥1,234"
    const priceM = /class="[^"]*a-offscreen[^"]*"[^>]*>([^<]+)/.exec(chunk)
    const priceRaw = priceM ? priceM[1].replace(/[^\d]/g, "") : "0"
    const price = toNumber(priceRaw)

    // Product image
    const imgM = /img[^>]+class="[^"]*s-image[^"]*"[^>]+src="([^"]+)"/.exec(
      chunk,
    )
    const image = imgM ? imgM[1] : ""

    // Rating (e.g. "4.5 5つ星のうち4.5")
    const ratingM = /aria-label="(\d+(?:\.\d+)?) 5つ星のうち/.exec(chunk)
    const reviewAverage = ratingM ? toNumber(ratingM[1]) : 0

    // Review count
    const countM =
      /aria-label="([0-9,]+)個の評価"/.exec(chunk) ??
      /([0-9,]+)\s*件のカスタマーレビュー/.exec(chunk)
    const reviewCount = countM ? toNumber(countM[1].replace(/,/g, "")) : 0

    items.push({ asin, title, price, image, reviewAverage, reviewCount })
  }

  return items
}

function rawToProduct(raw: RawItem): Product {
  return {
    id: `amazon:${raw.asin}`,
    title: raw.title,
    price: raw.price,
    image: raw.image,
    shop: "Amazon.co.jp",
    reviewCount: raw.reviewCount,
    reviewAverage: raw.reviewAverage,
    itemUrl: asinUrl(raw.asin),
    platform: "amazon",
  }
}

export async function searchAmazon(keyword: string): Promise<Product[]> {
  const trimmed = keyword.trim()
  if (!trimmed) return []

  const url = `${SEARCH_BASE}?k=${encodeURIComponent(trimmed)}&s=review-rank`

  let html: string
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      cache: "no-store",
      redirect: "follow",
    })
    // Amazon returns 503 / CAPTCHA pages with status 200 — treat obvious blocks
    if (!res.ok) return []
    html = await res.text()
  } catch {
    return []
  }

  // Sanity check: a real results page mentions typical Amazon UI strings
  if (
    !html.includes("s-search-result") &&
    !html.includes("data-asin") &&
    !html.includes("application/ld+json")
  ) {
    // Likely a bot-detection / CAPTCHA page — bail gracefully
    return []
  }

  // Try schema.org first (rarely present on search pages, but check anyway)
  const ldBlocks = extractJsonLd(html)
  for (const block of ldBlocks) {
    const arr = Array.isArray(block) ? block : [block]
    for (const node of arr) {
      if ((node as { "@type"?: string })?.["@type"] === "ItemList") {
        // Amazon occasionally adds ItemList — not common but handle it
        const list = node as {
          itemListElement?: Array<{
            item?: { name?: string; url?: string; offers?: { price?: number } }
          }>
        }
        const products: Product[] = []
        for (let i = 0; i < (list.itemListElement ?? []).length; i++) {
          const entry = list.itemListElement![i]
          const item = entry.item ?? {}
          const url = item.url ?? ""
          const asinM = /\/dp\/([A-Z0-9]{10})/.exec(url)
          const asin = asinM ? asinM[1] : `idx${i}`
          if (!item.name) continue
          products.push({
            id: `amazon:${asin}`,
            title: item.name,
            price: toNumber(item.offers?.price),
            image: "",
            shop: "Amazon.co.jp",
            reviewCount: 0,
            reviewAverage: 0,
            itemUrl: url || asinUrl(asin),
            platform: "amazon",
          })
        }
        if (products.length > 0) return products
      }
    }
  }

  // Fall back to HTML parsing
  const rawItems = parseAsinBlocks(html)
  return rawItems.map(rawToProduct)
}
