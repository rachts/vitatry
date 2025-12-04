"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Shield, Award, ArrowRight } from "lucide-react"
import { useEffect, useRef } from "react"
import anime from "animejs/lib/anime.es.js"
import { TiltCard } from "@/components/tilt-card"
import { RippleButton } from "@/components/ripple-button"
import { AnimatedCounter } from "@/components/animated-counter"
import { ParallaxSection } from "@/components/parallax-section"

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

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

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 noise-overlay">
      {/* Hero Section with parallax */}
      <section
        ref={heroRef}
        className="relative container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center overflow-hidden"
      >
        {/* Ambient glows */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10" />

        {/* Logo */}
        <div data-hero-logo className="animate-float" style={{ opacity: 0 }}>
          <img
            src="/images/design-mode/VITAMEND_LOGO.png"
            alt="VitaMend logo"
            className="h-24 w-24 drop-shadow-2xl"
            loading="eager"
          />
        </div>

        <h1
          data-hero-title
          className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
          style={{ opacity: 0 }}
        >
          <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
            Reviving Medicines,
          </span>
          <br />
          Restoring Lives
        </h1>

        <p
          data-hero-subtitle
          className="max-w-2xl text-pretty text-lg text-slate-600 dark:text-slate-400 md:text-xl"
          style={{ opacity: 0 }}
        >
          Donate your unused medicines. Our AI verifies safety and authenticity. We redistribute to people in need via
          trusted NGO partners.
        </p>

        <div data-hero-buttons className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <Link href="/donate">
            <RippleButton variant="primary" className="px-8 py-4 text-lg shadow-emerald-500/25">
              Donate Medicines
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </RippleButton>
          </Link>
          <Link href="/volunteer">
            <RippleButton variant="outline" className="px-8 py-4 text-lg">
              Become a Volunteer
            </RippleButton>
          </Link>
        </div>

        {/* Impact stats */}
        <div ref={statsRef} className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Donations", value: "1,248", suffix: "+" },
            { label: "Verified", value: "1,102", suffix: "" },
            { label: "Distributed", value: "18,420", suffix: " doses" },
            { label: "NGO Partners", value: "32", suffix: "" },
          ].map((s, i) => (
            <TiltCard key={s.label} tiltAmount={5}>
              <div
                data-stat-card
                className="rounded-xl border bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ opacity: 0 }}
              >
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <ParallaxSection speed={0.3}>
        <section className="py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-500">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How VitaMend Works</h2>
              <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                Our simple, secure process ensures your donated medicines reach those who need them most
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Heart,
                  color: "green",
                  title: "1. Donate",
                  desc: "Upload photos of your unused, unexpired medicines through our secure platform",
                },
                {
                  icon: Shield,
                  color: "blue",
                  title: "2. Verify",
                  desc: "Our AI system and certified pharmacists verify medicine quality and authenticity",
                },
                {
                  icon: Users,
                  color: "purple",
                  title: "3. Connect",
                  desc: "We match verified medicines with verified NGOs and healthcare providers",
                },
                {
                  icon: Award,
                  color: "orange",
                  title: "4. Impact",
                  desc: "Track your real-world impact and see how your donations help communities",
                },
              ].map((item, i) => (
                <TiltCard key={item.title} tiltAmount={8}>
                  <Card className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800 h-full group">
                    <CardHeader className="pb-4">
                      <div
                        className={`w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <item.icon className={`h-8 w-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                      </div>
                      <CardTitle className="text-xl dark:text-white">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base dark:text-slate-400">{item.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* Features Section */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose VitaMend?</h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              We've built the most trusted and efficient platform for medicine donation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                color: "emerald",
                title: "AI-Powered Verification",
                desc: "Advanced AI technology combined with expert pharmacist review ensures only safe, quality medicines are redistributed.",
              },
              {
                icon: Heart,
                color: "red",
                title: "Direct Impact",
                desc: "See exactly how your donations help real people in your community and beyond with detailed impact reports.",
              },
              {
                icon: Users,
                color: "blue",
                title: "Trusted Network",
                desc: "We work with verified NGOs, hospitals, and healthcare providers to ensure medicines reach those in need.",
              },
            ].map((item) => (
              <TiltCard key={item.title} tiltAmount={6}>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group h-full">
                  <div
                    className={`w-14 h-14 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className={`h-7 w-7 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 mb-10">
              Join thousands of donors and volunteers who are helping to reduce medical waste and improve healthcare
              access for everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <RippleButton variant="primary" className="px-10 py-4 text-lg">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </RippleButton>
              </Link>
              <Link href="/about">
                <RippleButton variant="outline" className="px-10 py-4 text-lg">
                  Learn More
                </RippleButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
