import type { Product } from "@/lib/types"

const RAKUTEN_ENDPOINT =
  "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"

// Shape of a single item in the Rakuten Ichiba Item Search response. Only the
// fields MarketTomo uses are typed.
interface RakutenItem {
  itemCode: string
  itemName: string
  itemPrice: number
  itemUrl: string
  shopName: string
  reviewCount: number
  reviewAverage: number
  mediumImageUrls?: { imageUrl: string }[]
  smallImageUrls?: { imageUrl: string }[]
}

interface RakutenResponse {
  Items?: { Item: RakutenItem }[]
  error?: string
  error_description?: string
}

// Raised when the upstream Rakuten request cannot be completed. The API route
// turns this into the user-facing "搜尋失敗，請稍後再試。" message.
export class RakutenError extends Error {}

// Rakuten image URLs carry a `?_ex=WIDTHxHEIGHT` query. Bump it so cards render
// a crisper thumbnail than the default 128px.
function upscaleImage(url: string): string {
  return url.replace(/_ex=\d+x\d+/, "_ex=300x300")
}

function toProduct(item: RakutenItem): Product {
  const rawImage =
    item.mediumImageUrls?.[0]?.imageUrl ?? item.smallImageUrls?.[0]?.imageUrl ?? ""

  return {
    id: item.itemCode,
    title: item.itemName,
    price: item.itemPrice,
    image: rawImage ? upscaleImage(rawImage) : "",
    shop: item.shopName,
    reviewCount: item.reviewCount,
    reviewAverage: item.reviewAverage,
    itemUrl: item.itemUrl,
    platform: "rakuten",
  }
}

export async function searchRakuten(keyword: string): Promise<Product[]> {
  const applicationId = process.env.RAKUTEN_APP_ID
  if (!applicationId) {
    throw new RakutenError("RAKUTEN_APP_ID is not configured")
  }

  const params = new URLSearchParams({
    applicationId,
    keyword,
    format: "json",
    hits: "28",
    imageFlag: "1",
    availability: "1",
  })

  let res: Response
  try {
    res = await fetch(`${RAKUTEN_ENDPOINT}?${params.toString()}`, {
      // Search is always fresh — never serve a cached result.
      cache: "no-store",
    })
  } catch {
    throw new RakutenError("Failed to reach Rakuten API")
  }

  if (!res.ok) {
    throw new RakutenError(`Rakuten API responded with ${res.status}`)
  }

  const data = (await res.json()) as RakutenResponse
  if (data.error) {
    throw new RakutenError(data.error_description ?? data.error)
  }

  return (data.Items ?? []).map((entry) => toProduct(entry.Item))
}
