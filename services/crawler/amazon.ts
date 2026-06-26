import type { Product } from "@/lib/types"

/**
 * Placeholder for the future Amazon crawler. Implement the same contract as
 * {@link import("./rakuten").searchRakuten} — fetch a search results page,
 * parse it, and return normalized `Product[]` with `platform: "amazon"`.
 */
export async function searchAmazon(_keyword: string): Promise<Product[]> {
  return []
}
