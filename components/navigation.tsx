"use client"

import Link from "next/link"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"
import { useEffect, useRef, useState } from "react"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const logoRef = useRef<HTMLAnchorElement>(null)
  const navLinksRef = useRef<HTMLElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const navItems = ["Donate", "Volunteer", "Transparency", "Founders"]

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

  const isActive = (item: string) => {
    const itemPath = `/${item.toLowerCase()}`
    return pathname === itemPath
  }

  return (
    <header
      className={`w-full sticky top-0 z-50 h-16 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
          : "bg-white dark:bg-slate-900"
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
            className="rounded transition-transform duration-300 ease-out group-hover:scale-110"
            priority
          />
          <span className="text-base font-semibold text-slate-900 dark:text-white transition-colors duration-300">
            VitaMend
          </span>
        </Link>

        {/* Desktop Navigation - Added active state styling */}
        <nav ref={navLinksRef} className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className={`relative text-sm font-medium transition-all duration-300 ease-out link-underline ${
                isActive(item)
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
              style={{ opacity: mounted ? undefined : 1 }}
            >
              {item}
              {isActive(item) && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions - Enhanced button hover effects */}
        <div ref={actionsRef} className="flex items-center gap-4" style={{ opacity: mounted ? undefined : 1 }}>
          <ThemeToggle />
          <Link
            href="/dashboard"
            className={`hidden sm:block rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
              pathname === "/dashboard"
                ? "bg-emerald-700 shadow-lg shadow-emerald-500/30"
                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25"
            }`}
          >
            Dashboard
          </Link>

          {/* Mobile menu button - Added rotate animation */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 ease-out"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <div
              className="transition-transform duration-300 ease-out"
              style={{ transform: mobileMenuOpen ? "rotate(90deg)" : "rotate(0)" }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Enhanced with smoother animation and active states */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav
          className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-4 px-4 space-y-1"
          aria-label="Mobile navigation"
        >
          {[...navItems, "Dashboard"].map((item, idx) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className={`block py-3 px-3 rounded-lg font-medium transition-all duration-200 ease-out ${
                isActive(item)
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
