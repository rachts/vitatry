"use client"

import { useEffect, useRef, type ReactNode, useState, useCallback } from "react"
import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevPathname = useRef(pathname)

  const animateTransition = useCallback(async () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion || !containerRef.current) {
      setDisplayChildren(children)
      return
    }

    setIsAnimating(true)

    // Exit animation
    containerRef.current.style.opacity = "0"
    containerRef.current.style.transform = "translateY(-10px)"

    await new Promise((resolve) => setTimeout(resolve, 150))

    setDisplayChildren(children)

    // Enter animation
    await new Promise((resolve) => setTimeout(resolve, 50))

    if (containerRef.current) {
      containerRef.current.style.opacity = "1"
      containerRef.current.style.transform = "translateY(0)"
    }

    setIsAnimating(false)
  }, [children])

  useEffect(() => {
    if (pathname !== prevPathname.current && !isAnimating) {
      prevPathname.current = pathname
      animateTransition()
    } else if (pathname === prevPathname.current) {
      setDisplayChildren(children)
    }
  }, [pathname, children, isAnimating, animateTransition])

  return (
    <div
      ref={containerRef}
      className="w-full transition-all duration-300 ease-out"
      style={{ opacity: 1, transform: "translateY(0)" }}
    >
      {displayChildren}
    </div>
  )
}
