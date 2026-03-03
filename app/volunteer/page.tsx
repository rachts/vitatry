import type { Metadata } from "next"
import VolunteerForm from "./volunteer-form"
import { Heart, Users, Clock, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Volunteer | VitaMend",
  description: "Join our mission to help distribute medicines to those in need. Become a volunteer today.",
}

const benefits = [
  {
    icon: Heart,
    title: "Make a Difference",
    description: "Help distribute essential medicines to underserved communities.",
  },
  {
    icon: Users,
    title: "Join a Community",
    description: "Connect with like-minded individuals passionate about healthcare access.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Choose volunteer shifts that fit your schedule and availability.",
  },
  {
    icon: Award,
    title: "Gain Experience",
    description: "Develop skills in healthcare logistics, coordination, and community service.",
  },
]

export default function VolunteerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Become a <span className="text-emerald-600">Volunteer</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your time and dedication can help save lives. Join our network of volunteers committed to making healthcare
            accessible for everyone.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Why Volunteer With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <VolunteerForm />
        </div>
      </section>
    </main>
  )
}
