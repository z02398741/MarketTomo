import type { Metadata } from "next"
import { Search as SearchIcon, Sparkles, Clock } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = { title: "Search" }

const suggestions = [
  "AI developer tools",
  "Vertical SaaS pricing",
  "Renewable energy storage",
  "Fintech in SEA",
]

const results = [
  {
    title: "Generative AI tooling market",
    type: "Market",
    blurb:
      "Estimated $18B TAM growing ~38% YoY. Fragmented vendor landscape with rapid consolidation expected.",
  },
  {
    title: "Nimbus Analytics",
    type: "Competitor",
    blurb:
      "Series B vertical analytics player. Strong mid-market traction, weak enterprise security posture.",
  },
  {
    title: "Data residency regulation (EU)",
    type: "Trend",
    blurb:
      "New cross-border data rules expected to land mid-2026, affecting go-to-market for cloud vendors.",
  },
]

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Search"
        description="Ask anything about a market, competitor, or trend — MarketTomo synthesizes the answer."
      />

      {/* Search bar */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="e.g. Who are the emerging players in AI observability?"
                className="h-11 pl-9"
              />
            </div>
            <Button type="submit" size="lg" className="h-11">
              <Sparkles className="size-4" />
              Research
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {suggestions.map((s) => (
              <Badge key={s} variant="secondary" className="cursor-pointer">
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {results.map((r) => (
            <Card key={r.title} className="transition-colors hover:border-primary/40">
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {r.type}
                </Badge>
                <CardTitle className="text-base">{r.title}</CardTitle>
                <CardDescription>{r.blurb}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Results are AI-generated summaries. Verify before acting on them.
        </div>
      </div>
    </div>
  )
}
