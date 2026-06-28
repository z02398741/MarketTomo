export interface AppSettings {
  profile: {
    name: string
    email: string
    role: string
  }
  workspace: {
    name: string
    region: string
  }
  notifications: {
    alerts: boolean
    digest: boolean
    product: boolean
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  profile: { name: "", email: "", role: "" },
  workspace: { name: "MarketTomo", region: "日本" },
  notifications: { alerts: true, digest: true, product: false },
}

const LS_KEY = "markettomo:settings"

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}

// Derive avatar initials from the profile name (up to 2 chars)
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "MT"
}
