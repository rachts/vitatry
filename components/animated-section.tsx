"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  animation?: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight"
}

export function AnimatedSection({ children, className = "", delay = 0, animation = "fadeUp" }: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      element.style.opacity = "1"
      element.style.transform = "none"
      return
    }

    // Set initial state based on animation type
    const initialStates: Record<string, { opacity: string; transform: string }> = {
      fadeUp: { opacity: "0", transform: "translateY(30px)" },
      fadeIn: { opacity: "0", transform: "none" },
      scaleIn: { opacity: "0", transform: "scale(0.95)" },
      slideLeft: { opacity: "0", transform: "translateX(-30px)" },
      slideRight: { opacity: "0", transform: "translateX(30px)" },
    }

    const initial = initialStates[animation]
    element.style.opacity = initial.opacity
    element.style.transform = initial.transform

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true

            import("animejs").then((animeModule) => {
              const anime = animeModule.default

              const animationConfigs: Record<string, object> = {
                fadeUp: { opacity: [0, 1], translateY: [30, 0] },
                fadeIn: { opacity: [0, 1] },
                scaleIn: { opacity: [0, 1], scale: [0.95, 1] },
                slideLeft: { opacity: [0, 1], translateX: [-30, 0] },
                slideRight: { opacity: [0, 1], translateX: [30, 0] },
              }

              anime({
                targets: element,
                ...animationConfigs[animation],
                duration: 600,
                delay,
                easing: "easeOutCubic",
              })
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [animation, delay])

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  )
}
