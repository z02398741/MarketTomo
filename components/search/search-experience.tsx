"use client"

import * as React from "react"
import { Search, Loader2, Sparkles, PackageSearch, AlertCircle } from "lucide-react"

import type { SearchSuccess } from "@/lib/types"
import { ProductCard } from "@/components/search/product-card"

type Status = "idle" | "loading" | "success" | "empty" | "error"

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
})

export function SearchExperience() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<Status>("idle")
  const [result, setResult] = React.useState<SearchSuccess | null>(null)
  const [errorMessage, setErrorMessage] = React.useState("")

  async function runSearch(event: React.FormEvent) {
    event.preventDefault()
    const keyword = query.trim()
    if (!keyword || status === "loading") return

    setStatus("loading")
    setResult(null)
    setErrorMessage("")

    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`)
      const data = await res.json()

      if (!res.ok || "error" in data) {
        setErrorMessage(data?.error ?? "搜尋失敗，請稍後再試。")
        setStatus("error")
        return
      }

      const success = data as SearchSuccess
      setResult(success)
      setStatus(success.products.length === 0 ? "empty" : "success")
    } catch {
      setErrorMessage("搜尋失敗，請稍後再試。")
      setStatus("error")
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      {/* Hero + search bar */}
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-[#b08cff] backdrop-blur-sm">
          <Sparkles className="size-3.5" />
          AI × Space × Market Analytics
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          搜尋<span className="text-cosmic-gradient">日本市場</span>商品
        </h1>

        <form onSubmit={runSearch} className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="商品名、關鍵字、品牌"
              aria-label="搜尋關鍵字"
              className="h-14 w-full rounded-xl border border-white/15 bg-white/5 pl-12 pr-4 text-base text-white placeholder:text-white/40 backdrop-blur-md outline-none transition focus:border-[#b08cff]/60 focus:ring-2 focus:ring-[#7b4fd8]/40"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || query.trim() === ""}
            className="btn-cosmic inline-flex h-14 items-center justify-center gap-2 rounded-xl px-7 text-base font-medium"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                搜尋中…
              </>
            ) : (
              <>
                <Search className="size-5" />
                搜尋
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result states */}
      {status === "idle" && <IdleState />}
      {status === "loading" && <LoadingGrid />}
      {status === "error" && <ErrorState message={errorMessage} />}
      {status === "empty" && <EmptyResults />}
      {status === "success" && result && (
        <div className="space-y-6">
          <ResultHeader result={result} />
          <ProductGrid result={result} />
        </div>
      )}
    </div>
  )
}

function ProductGrid({ result }: { result: SearchSuccess }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {result.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ResultHeader({ result }: { result: SearchSuccess }) {
  const { stats, keyword } = result
  const metrics = [
    { label: "商品數量", value: stats.count.toLocaleString() },
    { label: "平均價格", value: yen.format(stats.averagePrice) },
    { label: "最低價格", value: yen.format(stats.minPrice) },
    { label: "最高價格", value: yen.format(stats.maxPrice) },
  ]

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm text-white/60">
        搜尋關鍵字「<span className="font-medium text-white">{keyword}</span>」
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-xs text-white/50">{m.label}</p>
            <p className="mt-0.5 text-lg font-semibold text-white">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="glass-card flex animate-pulse flex-col overflow-hidden rounded-2xl"
        >
          <div className="aspect-square bg-white/5" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-2/3 rounded bg-white/10" />
            <div className="h-5 w-1/3 rounded bg-white/15" />
            <div className="h-9 w-full rounded-lg bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

function IdleState() {
  return (
    <StateMessage
      icon={<PackageSearch className="size-7 text-[#b08cff]" />}
      title="搜尋日本市場商品"
      description="輸入商品名、關鍵字或品牌，即可從楽天市場取得即時商品資料。"
    />
  )
}

function EmptyResults() {
  return (
    <StateMessage
      icon={<PackageSearch className="size-7 text-[#b08cff]" />}
      title="找不到相關商品。"
      description="試試其他關鍵字，或更換更通用的商品名稱。"
    />
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <StateMessage
      icon={<AlertCircle className="size-7 text-[#ff72c5]" />}
      title={message || "搜尋失敗，請稍後再試。"}
      description="請稍後再試一次。"
    />
  )
}

function StateMessage({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="glass-card mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl px-8 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        {icon}
      </div>
      <p className="text-lg font-medium text-white">{title}</p>
      <p className="text-sm text-white/50">{description}</p>
    </div>
  )
}
