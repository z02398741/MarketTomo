import type { Product } from "@/lib/types"

/**
 * Placeholder for the future Mercari crawler. Implement the same contract as
 * {@link import("./rakuten").searchRakuten} — fetch a search results page,
 * parse it, and return normalized `Product[]` with `platform: "mercari"`.
 */
export async function searchMercari(_keyword: string): Promise<Product[]> {
  return []
}
