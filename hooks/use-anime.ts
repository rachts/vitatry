"use client"

import { useEffect, useRef, useCallback } from "react"

type AnimeInstance = ReturnType<typeof import("animejs").default>
type AnimeParams = Parameters<typeof import("animejs").default>[0]
type AnimeTimelineParams = Parameters<ReturnType<typeof import("animejs").default>["timeline"]>[0]
type AnimeStaggerOptions = Parameters<ReturnType<typeof import("animejs").default>["stagger"]>[1]

export function useAnime() {
  const prefersReducedMotion = useRef(false)
  const animeRef = useRef<typeof import("animejs").default | null>(null)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Preload animejs
    import("animejs").then((mod) => {
      animeRef.current = mod.default
    })
  }, [])

  const animate = useCallback(async (params: AnimeParams) => {
    if (prefersReducedMotion.current) return null

    if (!animeRef.current) {
      const mod = await import("animejs")
      animeRef.current = mod.default
    }

    return animeRef.current(params)
  }, [])

  const timeline = useCallback(async (params?: AnimeTimelineParams) => {
    if (prefersReducedMotion.current) return null

    if (!animeRef.current) {
      const mod = await import("animejs")
      animeRef.current = mod.default
    }

    return animeRef.current.timeline(params)
  }, [])

  const stagger = useCallback(async (value: number, options?: AnimeStaggerOptions) => {
    if (!animeRef.current) {
      const mod = await import("animejs")
      animeRef.current = mod.default
    }

    return animeRef.current.stagger(value, options)
  }, [])

  return { animate, timeline, stagger, prefersReducedMotion: prefersReducedMotion.current }
}

export function useScrollAnimation(
  options: {
    threshold?: number
    rootMargin?: string
    animationConfig?: object
  } = {},
) {
  const elementRef = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      element.style.opacity = "1"
      element.style.transform = "none"
      return
    }

    // Set initial state
    element.style.opacity = "0"
    element.style.transform = "translateY(20px)"

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true

            import("animejs").then((animeModule) => {
              const anime = animeModule.default
              anime({
                targets: element,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 600,
                easing: "easeOutCubic",
                ...options.animationConfig,
              })
            })
          }
        })
      },
      {
        threshold: options.threshold ?? 0.1,
        rootMargin: options.rootMargin ?? "0px",
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return elementRef
}

export function usePageLoadAnimation(selector: string, staggerDelay = 80) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const elements = document.querySelectorAll(selector)
    if (elements.length === 0) return

    import("animejs").then((animeModule) => {
      const anime = animeModule.default
      anime({
        targets: selector,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
        delay: anime.stagger(staggerDelay),
        easing: "easeOutCubic",
      })
    })
  }, [selector, staggerDelay])
}
