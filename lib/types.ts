// Platforms MarketTomo can search. Only "rakuten" is live in V1, but the
// Product shape is platform-agnostic so Amazon / Mercari / Yahoo can be added
// later without changing the UI or API contract.
export type Platform = "rakuten" | "amazon" | "mercari" | "yahoo"

export interface Product {
  id: string
  title: string
  price: number
  image: string
  shop: string
  reviewCount: number
  reviewAverage: number
  itemUrl: string
  platform: Platform
}

export interface SearchStats {
  count: number
  averagePrice: number
  minPrice: number
  maxPrice: number
}

export interface SearchSuccess {
  keyword: string
  products: Product[]
  stats: SearchStats
}

export interface SearchError {
  error: string
}

export type SearchResponse = SearchSuccess | SearchError
