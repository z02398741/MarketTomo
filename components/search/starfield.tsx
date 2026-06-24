import * as React from "react"

// Deterministic PRNG so the server and client render identical star markup
// (no hydration mismatch). Seeded once, derived purely from the star index.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Star = {
  top: string
  left: string
  size: number
  duration: string
  delay: string
  min: number
  max: number
}

function generateStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed)
  return Array.from({ length: count }, () => {
    const size = +(rand() * 1.8 + 0.4).toFixed(2)
    return {
      top: `${(rand() * 100).toFixed(3)}%`,
      left: `${(rand() * 100).toFixed(3)}%`,
      size,
      duration: `${(rand() * 4 + 2.5).toFixed(2)}s`,
      delay: `${(rand() * 5).toFixed(2)}s`,
      min: +(rand() * 0.2 + 0.1).toFixed(2),
      max: +(rand() * 0.3 + 0.7).toFixed(2),
    }
  })
}

export function Starfield({ count = 150 }: { count?: number }) {
  const stars = generateStars(count, 0x4d61726b) // "Mark"

  return (
    <div className="starfield" aria-hidden>
      <div className="starfield-drift absolute inset-0">
        {stars.map((star, i) => (
          <span
            key={i}
            className="star"
            style={
              {
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                "--twinkle-duration": star.duration,
                "--twinkle-delay": star.delay,
                "--twinkle-min": star.min,
                "--twinkle-max": star.max,
                boxShadow:
                  star.size > 1.4
                    ? "0 0 6px 1px rgba(176,140,255,0.6)"
                    : undefined,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
