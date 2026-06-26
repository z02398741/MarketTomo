"use client"

import * as React from "react"
import { Search, Loader2, Sparkles, PackageSearch, AlertCircle, Wand2 } from "lucide-react"

import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/search/product-card"

type Status = "idle" | "loading" | "success" | "empty" | "error"

type SearchResult = { keyword: string; products: Product[] }

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
})

export function SearchExperience() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<Status>("idle")
  const [result, setResult] = React.useState<SearchResult | null>(null)
  const [errorMessage, setErrorMessage] = React.useState("")
  const [aiKeywords, setAiKeywords] = React.useState<string[]>([])

  // Non-blocking: ask the AI for related keywords AFTER the search resolves.
  // Failures are swallowed so they never affect the search flow.
  async function loadAiKeywords(keyword: string) {
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      })
      const data = await res.json()
      setAiKeywords(Array.isArray(data?.keywords) ? data.keywords : [])
    } catch {
      setAiKeywords([])
    }
  }

  async function performSearch(rawKeyword: string) {
    const keyword = rawKeyword.trim()
    if (!keyword) return

    setQuery(keyword)
    setStatus("loading")
    setResult(null)
    setErrorMessage("")
    setAiKeywords([])

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      })
      const data = (await res.json()) as
        | { success: true; total: number; products: Product[] }
        | { success: false; error: string }

      if (!res.ok || !data.success) {
        setErrorMessage(
          (!data.success && data.error) || "搜尋失敗，請稍後再試。"
        )
        setStatus("error")
        return
      }

      const products = data.products ?? []
      setResult({ keyword, products })
      setStatus(products.length === 0 ? "empty" : "success")
      void loadAiKeywords(keyword)
    } catch {
      setErrorMessage("搜尋失敗，請稍後再試。")
      setStatus("error")
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (status === "loading") return
    performSearch(query)
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

        <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
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
      {status === "empty" && (
        <div className="space-y-6">
          <EmptyResults />
          {aiKeywords.length > 0 && (
            <AiKeywords keywords={aiKeywords} onSelect={performSearch} />
          )}
        </div>
      )}
      {status === "success" && result && (
        <div className="space-y-6">
          <ResultHeader result={result} />
          {aiKeywords.length > 0 && (
            <AiKeywords keywords={aiKeywords} onSelect={performSearch} />
          )}
          <ProductGrid result={result} />
        </div>
      )}
    </div>
  )
}

function AiKeywords({
  keywords,
  onSelect,
}: {
  keywords: string[]
  onSelect: (keyword: string) => void
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
        <Wand2 className="size-4 text-[#b08cff]" />
        AI Keywords
      </div>
      <div className="flex flex-wrap gap-2.5">
        {keywords.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onSelect(keyword)}
            className="rounded-full border border-[#7b4fd8]/40 bg-[#7b4fd8]/15 px-3.5 py-1.5 text-sm text-[#e6dcff] shadow-[0_0_0_0_transparent] transition-all duration-200 hover:border-[#b08cff]/70 hover:bg-[#7b4fd8]/30 hover:text-white hover:shadow-[0_0_20px_-2px_#7b4fd8]"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProductGrid({ result }: { result: SearchResult }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {result.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ResultHeader({ result }: { result: SearchResult }) {
  const { products, keyword } = result
  const prices = products.map((p) => p.price).filter((p) => p > 0)
  const sum = prices.reduce((a, b) => a + b, 0)
  const stats = {
    count: products.length,
    averagePrice: prices.length ? Math.round(sum / prices.length) : 0,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  }
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
      description="輸入商品名、關鍵字或品牌，即可從樂天市場取得即時商品資料。"
    />
  )
}

function EmptyResults() {
  return (
    <StateMessage
      icon={<PackageSearch className="size-7 text-[#b08cff]" />}
      title="沒有找到商品。"
      description="試試其他關鍵字，或更換更通用的商品名稱。"
    />
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <StateMessage
      icon={<AlertCircle className="size-7 text-[#ff72c5]" />}
      title="搜尋失敗。"
      description={message || "請稍後再試一次。"}
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
