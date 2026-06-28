"use client"

import * as React from "react"
import { toast } from "sonner"
import type { Product } from "@/lib/types"

interface TrackingContextValue {
  trackedIds: Set<string>
  toggleTracking: (product: Product) => void
}

const TrackingContext = React.createContext<TrackingContextValue>({
  trackedIds: new Set(),
  toggleTracking: () => {},
})

export function useTracking() {
  return React.useContext(TrackingContext)
}

// Persist to localStorage so tracking survives page refreshes.
// When NEXT_PUBLIC_SUPABASE_URL is configured, also syncs to Supabase via the
// /api/tracking endpoint.
const LS_KEY = "markettomo:tracked"
const LS_PRODUCTS_KEY = "markettomo:tracked-products"

function readLocalStorage(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(LS_KEY)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeLocalStorage(ids: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // localStorage may be unavailable in some browsers
  }
}

function upsertProductCache(product: Product) {
  try {
    const raw = localStorage.getItem(LS_PRODUCTS_KEY)
    const arr: Product[] = raw ? JSON.parse(raw) : []
    const next = arr.filter((p) => p.id !== product.id)
    next.unshift(product)
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

function removeProductCache(id: string) {
  try {
    const raw = localStorage.getItem(LS_PRODUCTS_KEY)
    const arr: Product[] = raw ? JSON.parse(raw) : []
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(arr.filter((p) => p.id !== id)))
  } catch {
    // ignore
  }
}

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [trackedIds, setTrackedIds] = React.useState<Set<string>>(new Set())

  // Hydrate from localStorage after mount (avoids SSR/client mismatch).
  // startTransition defers the update so it isn't synchronous inside the effect.
  React.useEffect(() => {
    React.startTransition(() => setTrackedIds(readLocalStorage()))
  }, [])

  const toggleTracking = React.useCallback((product: Product) => {
    setTrackedIds((prev) => {
      const next = new Set(prev)
      const isTracked = next.has(product.id)

      if (isTracked) {
        next.delete(product.id)
        removeProductCache(product.id)
        toast.success(`已移除追蹤：${product.title.length > 30 ? product.title.slice(0, 30) + "…" : product.title}`)
        void fetch(`/api/tracking?id=${encodeURIComponent(product.id)}`, {
          method: "DELETE",
        }).catch(() => null)
      } else {
        next.add(product.id)
        upsertProductCache(product)
        toast.success(`已加入追蹤：${product.title.length > 30 ? product.title.slice(0, 30) + "…" : product.title}`)
        void fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product }),
        }).catch(() => null)
      }

      writeLocalStorage(next)
      return next
    })
  }, [])

  return (
    <TrackingContext.Provider value={{ trackedIds, toggleTracking }}>
      {children}
    </TrackingContext.Provider>
  )
}
