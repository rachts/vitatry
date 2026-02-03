"use client"

import { Shell } from "@/components/shell"
import { Linkedin, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, memo } from "react"
import { Button } from "@/components/ui/button"

const founders = [
  {
    name: "Rachit Kumar Tiwari",
    role: "Founder & Developer",
    image: "/images/img-20250508-025607.jpg",
    linkedin: "https://www.linkedin.com/in/rachitkrtiwari/",
  },
] as const

const FounderCard = memo(function FounderCard({
  founder,
  index,
}: {
  founder: (typeof founders)[number]
  index: number
}) {
  return (
    <div
      data-founder-card
      className="group bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center text-center transition-smooth hover-lift max-w-sm mx-auto"
      style={{
        opacity: 0,
        transform: "translateY(20px)",
      }}
    >
      {/* Profile Image - Larger size for single founder */}
      <div className="relative mb-6">
        <div className="w-32 h-32 rounded-full border-[3px] border-emerald-500 p-0.5 transition-smooth group-hover:scale-105 group-hover:border-orange-400 overflow-hidden">
          <Image
            src={founder.image || "/placeholder.svg"}
            alt={`${founder.name} - ${founder.role} at VitaMend`}
            width={128}
            height={128}
            className="w-full h-full rounded-full object-cover object-top bg-slate-200 dark:bg-slate-700"
            priority
          />
        </div>
      </div>

      {/* Name */}
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-1">{founder.name}</h3>

      {/* Role */}
      <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-6">{founder.role}</p>

      {/* LinkedIn Button */}
      <Button
        asChild
        variant="outline"
        size="default"
        className="w-full bg-transparent border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-400 transition-smooth hover-scale"
      >
        <Link href={founder.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
          <span className="text-slate-700 dark:text-slate-300">Visit LinkedIn for More Details</span>
          <ExternalLink className="h-3 w-3 ml-2 text-slate-400" />
        </Link>
      </Button>
    </div>
  )
})

export default function FoundersPage() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const cards = document.querySelectorAll("[data-founder-card]")

    cards.forEach((el, i) => {
      const element = el as HTMLElement
      if (prefersReducedMotion) {
        element.style.opacity = "1"
        element.style.transform = "none"
      } else {
        setTimeout(() => {
          element.style.transition =
            "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
          element.style.opacity = "1"
          element.style.transform = "translateY(0)"
        }, i * 100)
      }
    })
  }, [])

  return (
    <Shell>
      <div className="py-12 px-4 min-h-screen">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3">Meet the Founder</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">The visionary behind VitaMend.</p>
        </div>

        <div className="flex justify-center">
          {founders.map((founder, index) => (
            <FounderCard key={founder.name} founder={founder} index={index} />
          ))}
        </div>

        {/* Mission Section */}
        <div
          className="mt-16 bg-gradient-to-r from-emerald-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-8 text-center max-w-3xl mx-auto border border-slate-200 dark:border-slate-700 animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Bridging the gap between unused medicines and people in need.
          </p>
        </div>
      </div>
    </Shell>
  )
}
