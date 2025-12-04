"use client"

import { useEffect, useRef, useState } from "react"
import anime from "animejs/lib/anime.es.js"

interface AnimatedCounterProps {
  value: number | string
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  className = "",
  duration = 2000,
}: AnimatedCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const element = counterRef.current
    if (!element || hasAnimated) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)

            const numericValue = typeof value === "string" ? Number.parseInt(value.replace(/[^0-9]/g, "")) : value

            if (prefersReducedMotion) {
              element.textContent = `${prefix}${value}${suffix}`
              return
            }

            anime({
              targets: { count: 0 },
              count: numericValue,
              duration,
              easing: "easeOutExpo",
              round: 1,
              update: (anim) => {
                const current = Math.round(anim.animations[0].currentValue as number)
                element.textContent = `${prefix}${current.toLocaleString()}${suffix}`
              },
              complete: () => {
                element.textContent = `${prefix}${value}${suffix}`
              },
            })
          }
        })
      },
      { threshold: 0.5 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [value, suffix, prefix, duration, hasAnimated])

  return (
    <span ref={counterRef} className={className}>
      {prefix}0{suffix}
    </span>
  )
}
