import DonationForm from "./donation-form"

export const dynamic = "force-dynamic"

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-emerald-50 dark:from-slate-950 dark:to-emerald-950/20">
      <section className="container mx-auto px-4 py-10">
        {/* Header Section */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/images/design-mode/VITAMEND_LOGO.png" alt="VitaMend logo" className="h-12 w-12" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Donate Medicines</h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
            Help reduce medical waste and improve access to care.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your donated medicines are stored securely and redistributed at subsidized cost to people and organizations
            that need them the most.
          </p>
        </div>

        {/* Donation Form */}
        <DonationForm />

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-smooth hover-lift">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Safe Collection</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We collect medicines from your doorstep with proper handling and storage protocols.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-smooth hover-lift">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <span className="text-2xl">🔬</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">AI Verification</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Our AI system verifies expiry dates, packaging integrity, and medicine authenticity.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-smooth hover-lift">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
              <span className="text-2xl">💚</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Impact Tracking</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track where your donations go and see the real impact you make in the community.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
