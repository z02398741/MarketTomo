import type { Metadata } from "next"

import { Starfield } from "@/components/search/starfield"
import { SearchExperience } from "@/components/search/search-experience"

export const metadata: Metadata = { title: "Search" }

export default function SearchPage() {
  return (
    <div className="cosmic relative -m-4 min-h-[calc(100svh-4rem)] overflow-hidden md:-m-6 lg:-m-8">
      {/* Deep space backdrop + drifting starfield (always running) */}
      <div className="cosmic-bg absolute inset-0" />
      <Starfield count={160} />

      {/* Foreground */}
      <div className="relative z-10 px-4 py-14 md:px-8 lg:px-12">
        <SearchExperience />
      </div>
    </div>
  )
}
