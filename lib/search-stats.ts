// Track how many searches the user has performed this calendar month.
// Stored in localStorage as { month: "YYYY-MM", count: number }.

const LS_KEY = "markettomo:search-stats"
const MONTHLY_LIMIT = 1000

interface SearchStats {
  month: string
  count: number
}

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function loadSearchStats(): SearchStats {
  if (typeof window === "undefined")
    return { month: currentMonth(), count: 0 }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { month: currentMonth(), count: 0 }
    const stored = JSON.parse(raw) as SearchStats
    // Reset counter on new month
    if (stored.month !== currentMonth())
      return { month: currentMonth(), count: 0 }
    return stored
  } catch {
    return { month: currentMonth(), count: 0 }
  }
}

export function incrementSearchCount(): void {
  try {
    const stats = loadSearchStats()
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ ...stats, count: stats.count + 1 }),
    )
  } catch {
    // ignore
  }
}

export function getMonthlyLimit(): number {
  return MONTHLY_LIMIT
}
