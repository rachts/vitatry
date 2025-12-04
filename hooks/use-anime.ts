"use client"

import { useEffect, useRef, useCallback } from "react"
import anime from "animejs/lib/anime.es.js"

export function useAnime() {
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const animate = useCallback((params: anime.AnimeParams) => {
    if (prefersReducedMotion.current) {
      return null
    }
    return anime(params)
  }, [])

  const timeline = useCallback((params?: anime.AnimeTimelineParams) => {
    if (prefersReducedMotion.current) {
      return null
    }
    return anime.timeline(params)
  }, [])

  const stagger = useCallback((value: number, options?: anime.StaggerOptions) => {
    return anime.stagger(value, options)
  }, [])

  return { animate, timeline, stagger, prefersReducedMotion: prefersReducedMotion.current }
}

export function useScrollAnimation(
  options: {
    threshold?: number
    rootMargin?: string
    animationConfig?: anime.AnimeParams
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
            anime({
              targets: element,
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 600,
              easing: "easeOutCubic",
              ...options.animationConfig,
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

    anime({
      targets: selector,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 700,
      delay: anime.stagger(staggerDelay),
      easing: "easeOutCubic",
    })
  }, [selector, staggerDelay])
}
