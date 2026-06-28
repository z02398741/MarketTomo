import type { Platform } from "./types"

// Single source of truth for platform metadata.
// Both server-side crawlers and client-side UI import from here.

export const PLATFORM_LABELS: Record<Platform, string> = {
  rakuten: "樂天",
  amazon: "Amazon",
  mercari: "Mercari",
  yahoo: "Yahoo",
}

// All supported platforms in display order.
// Keep this in sync with services/crawler/index.ts activePlatforms.
export const ACTIVE_PLATFORMS: Platform[] = [
  "rakuten",
  "amazon",
  "mercari",
  "yahoo",
]
