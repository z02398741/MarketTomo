import { Star, ExternalLink, Plus, ImageOff } from "lucide-react"

import type { Product } from "@/lib/types"

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
})

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="glass-card glass-card-hover flex flex-col overflow-hidden rounded-2xl">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {product.image ? (
          // Rakuten thumbnails span many CDN hosts, so a plain <img> is more
          // robust here than next/image remotePatterns.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="size-full object-contain p-3"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-white/30">
            <ImageOff className="size-8" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#b08cff] backdrop-blur-sm">
          {product.platform}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white">
          {product.title}
        </h3>

        <p className="line-clamp-1 text-xs text-white/50">{product.shop}</p>

        <div className="mt-auto space-y-2">
          <p className="text-lg font-semibold text-cosmic-gradient">
            {yen.format(product.price)}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <Star className="size-3.5 fill-[#ff72c5] text-[#ff72c5]" />
            <span className="font-medium text-white/80">
              {product.reviewAverage > 0
                ? product.reviewAverage.toFixed(2)
                : "—"}
            </span>
            <span className="text-white/40">
              ({product.reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-2">
          <a
            href={product.itemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cosmic inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium"
          >
            查看商品
            <ExternalLink className="size-3.5" />
          </a>
          <button
            type="button"
            disabled
            aria-label="加入追蹤（即將推出）"
            title="加入追蹤（即將推出）"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 p-2 text-white/40 disabled:cursor-not-allowed"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </article>
  )
}
