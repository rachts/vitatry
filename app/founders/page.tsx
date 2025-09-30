import Image from "next/image"

export const metadata = {
  title: "Meet Our Founders | VitaMend",
  description:
    "Meet the founding team behind VitaMend — the platform reviving medicines and restoring lives through AI-verified redistribution.",
}

const founders = [
  {
    name: "Rachit Kumar Tiwari",
    role: "CEO & Visionary",
    bio: "CSE student, passionate about AI-driven healthcare.",
    image: "/images/rachit.png",
  },
  {
    name: "Founder 2",
    role: "CTO",
    bio: "Leads the engineering roadmap and platform reliability.",
    image: "/images/f2.png",
  },
  {
    name: "Founder 3",
    role: "COO",
    bio: "Drives operations, partnerships, and donor logistics.",
    image: "/images/f3.png",
  },
  {
    name: "Founder 4",
    role: "CMO",
    bio: "Builds the VitaMend brand and community outreach.",
    image: "/images/f4.png",
  },
]

export default function FoundersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50">
      <section className="container mx-auto px-4 py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Meet Our Founders</h1>
          <p className="mt-3 text-lg text-slate-600">
            The people behind VitaMend&apos;s mission to reduce medical waste and improve access to care.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {founders.map((f) => (
            <article
              key={f.name}
              className="group relative overflow-hidden rounded-2xl border bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-100 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={f.image || "/placeholder.svg"}
                    alt={`${f.name} headshot`}
                    fill
                    sizes="96px"
                    className="object-cover"
                    priority={false}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{f.name}</h3>
                  <p className="text-emerald-700 font-medium">{f.role}</p>
                  <p className="mt-2 text-slate-600">{f.bio}</p>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-100 blur-2xl" />
                <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-emerald-50 blur-2xl" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
