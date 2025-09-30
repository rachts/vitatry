import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import VolunteerForm from "./volunteer-form"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Shield, Award } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function VolunteerPage() {
  const session = await getServerSession(authOptions).catch(() => null)

  // If auth is required for volunteering, keep this redirect. Otherwise remove it.
  if (!session) {
    // redirect("/auth/signin?callbackUrl=/volunteer")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <img
            src="/images/design-mode/VITAMEND_LOGO.png"
            alt="VitaMend logo"
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Volunteer with VitaMend</h1>
            <p className="text-slate-600">Help collect, verify, and distribute medicines to those in need.</p>
          </div>
        </div>

        {/* Volunteer Opportunities */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
            <Shield className="h-10 w-10 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-green-800 mb-2">Medicine Verification</h3>
            <p className="text-sm text-green-700">Verify donated medicines using AI-backed tools</p>
          </Card>
          <Card className="text-center p-6 border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
            <Users className="h-10 w-10 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-blue-800 mb-2">Pickup & Delivery</h3>
            <p className="text-sm text-blue-700">Assist with collecting medicines and delivering to NGOs</p>
          </Card>
          <Card className="text-center p-6 border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow">
            <Heart className="h-10 w-10 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-purple-800 mb-2">Community Outreach</h3>
            <p className="text-sm text-purple-700">Spread awareness about medicine donation</p>
          </Card>
          <Card className="text-center p-6 border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow">
            <Award className="h-10 w-10 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-orange-800 mb-2">Admin Support</h3>
            <p className="text-sm text-orange-700">Help with documentation and coordination</p>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <VolunteerForm />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
