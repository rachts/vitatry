"use client"

import Link from "next/link"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"
import { useEffect, useRef, useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navigation() {
  const logoRef = useRef<HTMLAnchorElement>(null)
  const navLinksRef = useRef<HTMLElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      // Show all elements without animation
      if (logoRef.current) logoRef.current.style.opacity = "1"
      navLinksRef.current?.querySelectorAll("a").forEach((el) => ((el as HTMLElement).style.opacity = "1"))
      if (actionsRef.current) actionsRef.current.style.opacity = "1"
      return
    }

    import("animejs").then((animeModule) => {
      const anime = animeModule.default

      const tl = anime.timeline({
        easing: "easeOutCubic",
      })

      tl.add({
        targets: logoRef.current,
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 500,
      })

      tl.add(
        {
          targets: navLinksRef.current?.querySelectorAll("a"),
          opacity: [0, 1],
          translateY: [-8, 0],
          duration: 400,
          delay: anime.stagger(60),
        },
        "-=300",
      )

      tl.add(
        {
          targets: actionsRef.current,
          opacity: [0, 1],
          translateX: [10, 0],
          duration: 400,
        },
        "-=200",
      )
    })
  }, [mounted])

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 h-16 ${
        scrolled ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg" : "bg-white dark:bg-slate-900"
      } border-b border-gray-200/50 dark:border-slate-800/50`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          ref={logoRef}
          href="/"
          className="flex items-center gap-2 group"
          aria-label="VitaMend Home"
          style={{ opacity: mounted ? undefined : 1 }}
        >
          <Image
            src="/images/design-mode/VITAMEND_LOGO.png"
            alt="VitaMend logo"
            width={32}
            height={32}
            className="rounded transition-transform duration-300 group-hover:scale-110"
            priority
          />
          <span className="text-base font-semibold text-slate-900 dark:text-white">VitaMend</span>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={navLinksRef} className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
          {["Donate", "Volunteer", "Transparency", "Founders"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="relative text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors link-underline"
              style={{ opacity: mounted ? undefined : 1 }}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div ref={actionsRef} className="flex items-center gap-4" style={{ opacity: mounted ? undefined : 1 }}>
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="hidden sm:block rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 transform hover:scale-[1.02]"
          >
            Dashboard
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-4 px-4 space-y-3 animate-fade-in-up"
          aria-label="Mobile navigation"
        >
          {["Donate", "Volunteer", "Transparency", "Founders", "Dashboard"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="block py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
