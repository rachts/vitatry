"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Shield, Award, ArrowRight } from "lucide-react"

const TiltCard = dynamic(() => import("@/components/tilt-card").then((m) => ({ default: m.TiltCard })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl h-full" />,
})

const RippleButton = dynamic(() => import("@/components/ripple-button").then((m) => ({ default: m.RippleButton })), {
  ssr: false,
  loading: () => (
    <button className="px-8 py-4 text-lg rounded-lg bg-emerald-600 text-white font-semibold">Loading...</button>
  ),
})

const AnimatedCounter = dynamic(
  () => import("@/components/animated-counter").then((m) => ({ default: m.AnimatedCounter })),
  {
    ssr: false,
    loading: () => <span>0</span>,
  },
)

const ParallaxSection = dynamic(
  () => import("@/components/parallax-section").then((m) => ({ default: m.ParallaxSection })),
  {
    ssr: false,
    loading: ({ children }) => <div>{children}</div>,
  },
)

const HeroAnimations = dynamic(() => import("@/components/hero-animations"), {
  ssr: false,
})

// Stats data
const stats = [
  { label: "Donations", value: "0", suffix: "" },
  { label: "Verified", value: "0", suffix: "" },
  { label: "Distributed", value: "0", suffix: "" },
  { label: "NGO Partners", value: "0", suffix: "" },
]

// How it works data
const howItWorks = [
  {
    icon: Heart,
    color: "emerald",
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
]

// Features data
const features = [
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
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500">
      <HeroAnimations />

      {/* Hero Section */}
      <section className="relative container mx-auto flex flex-col items-center gap-6 px-4 py-20 text-center overflow-hidden">
        {/* Ambient glows - CSS only, no JS */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10" />

        <div data-hero-logo className="animate-float">
          <Image
            src="/images/design-mode/VITAMEND_LOGO.png"
            alt="VitaMend logo - Medicine donation platform"
            width={96}
            height={96}
            priority
            className="drop-shadow-2xl"
            fetchPriority="high"
          />
        </div>

        <h1
          data-hero-title
          className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
        >
          <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent animate-gradient">
            Reviving Medicines,
          </span>
          <br />
          Restoring Lives
        </h1>

        <p data-hero-subtitle className="max-w-2xl text-pretty text-lg text-slate-600 dark:text-slate-400 md:text-xl">
          Donate your unused medicines. Our AI verifies safety and authenticity. We redistribute to people in need via
          trusted NGO partners.
        </p>

        <div data-hero-buttons className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <Link href="/donate" aria-label="Donate medicines to those in need">
            <RippleButton variant="primary" className="px-8 py-4 text-lg shadow-emerald-500/25">
              Donate Medicines
              <ArrowRight className="ml-2 h-5 w-5 inline" aria-hidden="true" />
            </RippleButton>
          </Link>
          <Link href="/volunteer" aria-label="Become a volunteer with VitaMend">
            <RippleButton variant="outline" className="px-8 py-4 text-lg">
              Become a Volunteer
            </RippleButton>
          </Link>
        </div>

        {/* Impact stats - fixed dimensions to prevent CLS */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <TiltCard key={s.label} tiltAmount={5}>
              <div
                data-stat-card
                className="rounded-xl border bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 min-h-[100px]"
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
              {howItWorks.map((item) => (
                <TiltCard key={item.title} tiltAmount={8}>
                  <Card className="text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800 h-full group min-h-[280px]">
                    <CardHeader className="pb-4">
                      <div
                        className={`w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <item.icon
                          className={`h-8 w-8 text-${item.color}-600 dark:text-${item.color}-400`}
                          aria-hidden="true"
                        />
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
              We&apos;ve built the most trusted and efficient platform for medicine donation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item) => (
              <TiltCard key={item.title} tiltAmount={6}>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group h-full min-h-[240px]">
                  <div
                    className={`w-14 h-14 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon
                      className={`h-7 w-7 text-${item.color}-600 dark:text-${item.color}-400`}
                      aria-hidden="true"
                    />
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
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" aria-hidden="true" />
        <div
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"
          aria-hidden="true"
        />

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
              <Link href="/auth/signup" aria-label="Get started with VitaMend today">
                <RippleButton variant="primary" className="px-10 py-4 text-lg">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 inline" aria-hidden="true" />
                </RippleButton>
              </Link>
              <Link href="/about" aria-label="Learn more about VitaMend">
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
