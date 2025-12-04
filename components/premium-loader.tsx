"use client"

import { useEffect, useRef, useState } from "react"
import anime from "animejs/lib/anime.es.js"

export function PremiumLoader() {
  const [isVisible, setIsVisible] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      setIsVisible(false)
      return
    }

    // Logo pulse animation
    anime({
      targets: logoRef.current,
      scale: [0.8, 1, 0.8],
      opacity: [0.5, 1, 0.5],
      duration: 1500,
      easing: "easeInOutSine",
      loop: true,
    })

    // Progress bar animation
    anime({
      targets: progressRef.current,
      width: ["0%", "100%"],
      duration: 2000,
      easing: "easeInOutQuad",
    })

    // Text fade
    anime({
      targets: textRef.current,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 600,
      delay: 300,
      easing: "easeOutCubic",
    })

    // Fade out loader after content is ready
    const timer = setTimeout(() => {
      anime({
        targets: loaderRef.current,
        opacity: [1, 0],
        duration: 500,
        easing: "easeInQuad",
        complete: () => setIsVisible(false),
      })
    }, 2200)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />

      {/* Logo */}
      <div ref={logoRef} className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full"
          style={{ width: 0 }}
        />
      </div>

      {/* Loading text */}
      <span ref={textRef} className="text-sm text-slate-600 dark:text-slate-400 font-medium" style={{ opacity: 0 }}>
        Loading VitaMend...
      </span>
    </div>
  )
}
