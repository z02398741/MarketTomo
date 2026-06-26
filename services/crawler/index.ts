import type { Platform, Product } from "@/lib/types"
import { searchRakuten } from "./rakuten"
import { searchAmazon } from "./amazon"
import { searchMercari } from "./mercari"

// Every platform crawler implements the same contract: keyword in, Product[] out.
export type SearchCrawler = (keyword: string) => Promise<Product[]>

// Registry of available crawlers. Add new platforms here once implemented.
export const crawlers: Record<Platform, SearchCrawler> = {
  rakuten: searchRakuten,
  amazon: searchAmazon,
  mercari: searchMercari,
  yahoo: async () => [],
}

// Platforms that are actually wired up (used by the UI / API today).
export const activePlatforms: Platform[] = ["rakuten"]

/**
 * Run a single platform's crawler.
 */
export function crawl(platform: Platform, keyword: string): Promise<Product[]> {
  return crawlers[platform](keyword)
}

export { searchRakuten, searchAmazon, searchMercari }
export { CrawlerError } from "./rakuten"
