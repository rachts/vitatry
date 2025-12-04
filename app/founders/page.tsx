"use client"

import { Shell } from "@/components/shell"
import { Facebook, Twitter, Instagram } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, memo } from "react"
import anime from "animejs/lib/anime.es.js"
import { TiltCard } from "@/components/tilt-card"

const founders = [
  {
    name: "Rachit Tiwari",
    role: "Lead Developer",
    image: "/professional-young-indian-man-developer-smiling.jpg",
    bio: "Full-stack developer passionate about healthcare innovation and building scalable AI-powered solutions for medicine redistribution.",
    socials: {
      facebook: "https://facebook.com/rachit.tiwari",
      twitter: "https://twitter.com/rachit_dev",
      instagram: "https://instagram.com/rachit.tiwari",
    },
  },
  {
    name: "Priya Sharma",
    role: "Healthcare Lead",
    image: "/professional-indian-woman-doctor-smiling.jpg",
    bio: "Medical professional with 8+ years in pharmaceutical logistics. Expert in medicine safety protocols and NGO partnerships.",
    socials: {
      facebook: "https://facebook.com/priya.sharma",
      twitter: "https://twitter.com/priya_health",
      instagram: "https://instagram.com/priya.vitamend",
    },
  },
  {
    name: "Arjun Mehta",
    role: "AI Engineer",
    image: "/professional-indian-man-engineer-with-glasses.jpg",
    bio: "AI/ML specialist focused on computer vision and OCR systems. Building intelligent verification systems for medicine quality.",
    socials: {
      facebook: "https://facebook.com/arjun.mehta",
      twitter: "https://twitter.com/arjun_ai",
      instagram: "https://instagram.com/arjun.ai",
    },
  },
  {
    name: "Sneha Patel",
    role: "Operations Director",
    image: "/professional-indian-woman-business-executive.jpg",
    bio: "Operations expert with supply chain background. Coordinating medicine distribution and donor-to-recipient workflows.",
    socials: {
      facebook: "https://facebook.com/sneha.patel",
      twitter: "https://twitter.com/sneha_ops",
      instagram: "https://instagram.com/sneha.vitamend",
    },
  },
] as const

const FounderCard = memo(function FounderCard({
  founder,
  index,
}: {
  founder: (typeof founders)[number]
  index: number
}) {
  const imageRef = useRef<HTMLDivElement>(null)

  return (
    <TiltCard tiltAmount={8}>
      <div
        data-founder-card
        className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 flex flex-col items-center text-center transition-all duration-300"
        style={{ opacity: 0, transform: "translateY(30px)" }}
      >
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-emerald-400 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
          <div
            ref={imageRef}
            className="relative w-28 h-28 rounded-full border-[3px] border-orange-400 p-1 transform transition-transform duration-300 group-hover:scale-105"
            data-founder-image
          >
            <Image
              src={founder.image || "/placeholder.svg"}
              alt={`${founder.name} - ${founder.role}`}
              width={112}
              height={112}
              className="w-full h-full rounded-full object-cover bg-slate-200 dark:bg-slate-700"
              loading="lazy"
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2 tracking-tight">{founder.name}</h3>

        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-3 line-clamp-4 min-h-[5rem]">
          {founder.bio}
        </p>

        <p className="text-orange-500 font-medium text-sm mb-5">{founder.role}</p>

        <div className="flex gap-4">
          {[
            {
              href: founder.socials.facebook,
              icon: Facebook,
              hoverColor: "hover:text-blue-600 dark:hover:text-blue-400",
              label: "Facebook",
            },
            {
              href: founder.socials.twitter,
              icon: Twitter,
              hoverColor: "hover:text-sky-500 dark:hover:text-sky-400",
              label: "Twitter",
            },
            {
              href: founder.socials.instagram,
              icon: Instagram,
              hoverColor: "hover:text-pink-500 dark:hover:text-pink-400",
              label: "Instagram",
            },
          ].map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 text-slate-400 ${social.hoverColor} transition-all duration-300 hover:scale-125 hover:-translate-y-1`}
              aria-label={`${founder.name} ${social.label} profile`}
            >
              <social.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </TiltCard>
  )
})

export default function FoundersPage() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const missionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      document.querySelectorAll("[data-founder-card]").forEach((el) => {
        ;(el as HTMLElement).style.opacity = "1"
        ;(el as HTMLElement).style.transform = "none"
      })
      if (titleRef.current) titleRef.current.style.opacity = "1"
      if (missionRef.current) missionRef.current.style.opacity = "1"
      return
    }

    const tl = anime.timeline({
      easing: "easeOutCubic",
    })

    tl.add({
      targets: titleRef.current,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
    })

    tl.add(
      {
        targets: "[data-founder-card]",
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
        delay: anime.stagger(100),
      },
      "-=300",
    )

    tl.add(
      {
        targets: "[data-founder-image]",
        scale: [0.9, 1],
        duration: 500,
        delay: anime.stagger(100),
        easing: "easeOutBack",
      },
      "-=500",
    )

    tl.add(
      {
        targets: missionRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
      },
      "-=200",
    )
  }, [])

  return (
    <Shell>
      <div className="py-16 px-4 bg-gradient-to-b from-slate-100 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 min-h-screen transition-colors duration-500 noise-overlay">
        <div className="fixed top-1/4 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <h1
          ref={titleRef}
          className="text-4xl md:text-5xl font-light text-center text-slate-800 dark:text-white mb-16 tracking-tight"
          style={{ opacity: 0 }}
        >
          Meet Our Team
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
          {founders.map((founder, index) => (
            <FounderCard key={founder.name} founder={founder} index={index} />
          ))}
        </div>

        <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">
          Images by <span className="text-orange-500 hover:underline cursor-pointer">VitaMend</span>
        </p>

        <div
          ref={missionRef}
          className="mt-16 bg-gradient-to-r from-emerald-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-8 md:p-10 text-center max-w-4xl mx-auto transition-colors duration-300 shadow-xl relative overflow-hidden"
          style={{ opacity: 0 }}
        >
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />

          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight relative z-10">
            Our Mission
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base md:text-lg relative z-10">
            We believe in the power of technology to solve real-world problems. VitaMend exists to bridge the gap
            between unused medicines and people in need, creating a sustainable ecosystem where healthcare waste is
            eliminated and lives are saved.
          </p>
        </div>
      </div>
    </Shell>
  )
}
