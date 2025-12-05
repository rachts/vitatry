"use client"

import { useEffect } from "react"

export default function HeroAnimations() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    import("animejs").then((animeModule) => {
      const anime = animeModule.default

      const tl = anime.timeline({
        easing: "easeOutCubic",
      })

      tl.add({
        targets: "[data-hero-logo]",
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 600,
      })
        .add(
          {
            targets: "[data-hero-title]",
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 700,
          },
          "-=300",
        )
        .add(
          {
            targets: "[data-hero-subtitle]",
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
          },
          "-=400",
        )
        .add(
          {
            targets: "[data-hero-buttons] > *",
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500,
            delay: anime.stagger(100),
          },
          "-=300",
        )

      // Stats animation on scroll
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              anime({
                targets: "[data-stat-card]",
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                delay: anime.stagger(100),
                easing: "easeOutCubic",
              })
              observer.disconnect()
            }
          })
        },
        { threshold: 0.3 },
      )

      const statsSection = document.querySelector("[data-stat-card]")?.parentElement
      if (statsSection) {
        observer.observe(statsSection)
      }

      return () => observer.disconnect()
    })
  }, [])

  return null
}
