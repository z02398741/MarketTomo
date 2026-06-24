import Link from "next/link"
import { ArrowUpRight, Activity, Eye, Radar, TrendingUp } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  { label: "Tracked markets", value: "24", delta: "+3", icon: Radar },
  { label: "Signals this week", value: "318", delta: "+12%", icon: Activity },
  { label: "Competitors watched", value: "57", delta: "+5", icon: Eye },
  { label: "Trend score", value: "82", delta: "+4 pts", icon: TrendingUp },
]

const insights = [
  {
    title: "AI infrastructure spend accelerating",
    market: "Cloud & Compute",
    summary:
      "Enterprise GPU demand is outpacing supply for the third quarter running — pricing power is shifting to incumbents.",
    tone: "Opportunity",
  },
  {
    title: "New entrant in vertical SaaS analytics",
    market: "B2B SaaS",
    summary:
      "A well-funded startup launched a competing product targeting your mid-market segment.",
    tone: "Watch",
  },
  {
    title: "Regulatory shift in data residency",
    market: "Compliance",
    summary:
      "Upcoming EU rules may affect go-to-market timing for two of your tracked markets.",
    tone: "Risk",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your AI market research, summarized at a glance."
      >
        <Button variant="outline" size="lg" render={<Link href="/tracking" />}>
          View tracking
        </Button>
        <Button size="lg" render={<Link href="/search" />}>
          New research
        </Button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary self-start [grid-area:1/2/3/3] justify-self-end">
                <stat.icon className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-emerald-600 dark:text-emerald-400">
                {stat.delta}
              </Badge>
              <span className="ml-2 text-xs text-muted-foreground">
                vs last week
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Latest insights</h2>
          <Button variant="ghost" size="sm" render={<Link href="/search" />}>
            Explore all
            <ArrowUpRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {insights.map((insight) => (
            <Card key={insight.title} className="transition-colors hover:border-primary/40">
              <CardHeader>
                <Badge
                  variant="outline"
                  className="w-fit border-primary/30 text-primary"
                >
                  {insight.market}
                </Badge>
                <CardTitle className="text-base leading-snug">
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{insight.summary}</p>
                <Badge variant="secondary">{insight.tone}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
