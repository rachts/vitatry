import { Shell } from "@/components/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

const founders = [
  {
    name: "Rachit Kumar Tiwari",
    role: "Founder & Lead Developer",
    image: "/images/design-mode/VITAMEND_LOGO.png",
    bio: "Full-stack developer passionate about healthcare innovation and sustainable medicine redistribution.",
    socials: {
      linkedin: "https://linkedin.com",
      github: "https://github.com",
      email: "rachit@vitamend.org",
    },
  },
  {
    name: "Coming Soon",
    role: "Co-Founder",
    image: "/placeholder-user.jpg",
    bio: "Join our team and help us revolutionize medicine donation.",
    socials: {
      linkedin: "#",
      github: "#",
      email: "#",
    },
  },
]

export default function FoundersPage() {
  return (
    <Shell>
      <div className="space-y-12 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">Meet Our Founders</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Passionate individuals dedicated to reviving medicines and restoring lives through technology and
            compassion.
          </p>
        </div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {founders.map((founder) => (
            <Card
              key={founder.name}
              className="overflow-hidden dark:border-slate-800 dark:bg-slate-900 hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-0">
                <div className="flex flex-col items-center text-center space-y-4">
                  <img
                    src={founder.image || "/placeholder.svg"}
                    alt={founder.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-900"
                  />
                  <div>
                    <CardTitle className="text-2xl text-slate-900 dark:text-white">{founder.name}</CardTitle>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mt-1">{founder.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-600 dark:text-slate-400 text-center">{founder.bio}</p>

                {/* Social Links */}
                <div className="flex justify-center gap-4">
                  {founder.socials.linkedin !== "#" && (
                    <Link
                      href={founder.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5 text-blue-600" />
                    </Link>
                  )}
                  {founder.socials.github !== "#" && (
                    <Link
                      href={founder.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5 text-slate-900 dark:text-white" />
                    </Link>
                  )}
                  {founder.socials.email !== "#" && (
                    <Link
                      href={`mailto:${founder.socials.email}`}
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="h-5 w-5 text-red-600" />
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-8 text-center space-y-4 border border-emerald-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We believe in the power of technology to solve real-world problems. VitaMend exists to bridge the gap
            between unused medicines and people in need, creating a sustainable ecosystem where healthcare waste is
            eliminated and lives are saved.
          </p>
        </div>

        {/* Join Us CTA */}
        <div className="bg-emerald-600 dark:bg-emerald-700 rounded-lg p-8 text-center text-white space-y-4">
          <h2 className="text-2xl font-bold">Join Our Mission</h2>
          <p className="max-w-2xl mx-auto">
            Are you passionate about healthcare and making a difference? We're looking for talented individuals to join
            our team. Reach out to us!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="mailto:careers@vitamend.org"
              className="inline-block px-6 py-2 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Email Us
            </Link>
            <Link
              href="/volunteer"
              className="inline-block px-6 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Volunteer
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  )
}
