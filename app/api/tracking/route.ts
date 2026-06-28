import { NextResponse, type NextRequest } from "next/server"
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase-server"
import type { Product } from "@/lib/types"

function notConfigured() {
  return NextResponse.json(
    { success: false, error: "Supabase 尚未設定。" },
    { status: 503 },
  )
}

// GET /api/tracking — list all tracked items
export async function GET() {
  if (!isSupabaseConfigured()) return notConfigured()

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("tracked_items")
    .select("*")
    .order("tracked_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    )
  }

  // Map DB rows back to the Product shape the UI expects
  const products: Product[] = (data ?? []).map((row) => ({
    id: row.product_id,
    title: row.title,
    price: Number(row.price),
    image: row.image,
    shop: row.shop,
    reviewCount: row.review_count,
    reviewAverage: Number(row.review_average),
    itemUrl: row.item_url,
    platform: row.platform,
  }))

  return NextResponse.json({ success: true, products, total: products.length })
}

// POST /api/tracking — add a product to tracking
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return notConfigured()

  const body = await request.json().catch(() => null)
  const product: Product | null =
    body?.product && typeof body.product === "object" ? body.product : null

  if (!product?.id || !product.title || !product.itemUrl) {
    return NextResponse.json(
      { success: false, error: "商品資料不完整。" },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("tracked_items").upsert(
    {
      product_id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      shop: product.shop,
      item_url: product.itemUrl,
      platform: product.platform,
      review_count: product.reviewCount,
      review_average: product.reviewAverage,
    },
    { onConflict: "product_id" },
  )

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/tracking?id={productId} — remove a product from tracking
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) return notConfigured()

  const productId = request.nextUrl.searchParams.get("id")
  if (!productId) {
    return NextResponse.json(
      { success: false, error: "缺少商品 ID。" },
      { status: 400 },
    )
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("tracked_items")
    .delete()
    .eq("product_id", productId)

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
