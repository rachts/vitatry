export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-[#f8faff]">
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-[#1a472a] mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">1. Acceptance of Terms</h2>
            <p className="text-[#2d3748] mb-4">
              By accessing and using VitaMend ("the Platform"), you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">2. Medicine Donation Guidelines</h2>
            <div className="text-[#2d3748] space-y-4">
              <p>
                <strong>Eligible Medicines:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unexpired medicines with at least 6 months remaining before expiry</li>
                <li>Medicines in original, unopened packaging</li>
                <li>Properly stored medicines (temperature, humidity controlled)</li>
                <li>Prescription and over-the-counter medications</li>
              </ul>

              <p>
                <strong>Prohibited Items:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Controlled substances and narcotics</li>
                <li>Expired or near-expiry medicines (less than 6 months)</li>
                <li>Opened, damaged, or tampered packaging</li>
                <li>Medicines without clear labeling or batch numbers</li>
                <li>Recalled medications</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">3. Verification Process</h2>
            <p className="text-[#2d3748] mb-4">
              All donated medicines undergo rigorous verification by licensed pharmacists. We reserve the right to
              reject any donation that does not meet our safety and quality standards. Rejected medicines will be
              disposed of safely according to environmental regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">4. User Responsibilities</h2>
            <div className="text-[#2d3748] space-y-4">
              <p>
                <strong>Donors must:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information about donated medicines</li>
                <li>Ensure medicines have been stored properly</li>
                <li>Not donate medicines obtained illegally</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <p>
                <strong>Volunteers must:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Follow all safety protocols during collection and handling</li>
                <li>Maintain confidentiality of donor information</li>
                <li>Report any safety concerns immediately</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">5. Liability and Disclaimers</h2>
            <p className="text-[#2d3748] mb-4">
              VitaMend acts as an intermediary platform. While we implement strict verification processes, we cannot
              guarantee the efficacy or safety of redistributed medicines. Recipients should consult healthcare
              professionals before using any medicines obtained through our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">6. Intellectual Property</h2>
            <p className="text-[#2d3748] mb-4">
              The VitaMend platform, including its design, functionality, and content, is protected by copyright and
              other intellectual property laws. Users may not reproduce, distribute, or create derivative works without
              explicit permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">7. Termination</h2>
            <p className="text-[#2d3748] mb-4">
              We reserve the right to terminate or suspend access to our platform for users who violate these terms or
              engage in activities that compromise the safety and integrity of our mission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">8. Changes to Terms</h2>
            <p className="text-[#2d3748] mb-4">
              VitaMend reserves the right to modify these terms at any time. Users will be notified of significant
              changes, and continued use of the platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">9. Contact Information</h2>
            <p className="text-[#2d3748] mb-4">For questions about these Terms of Service, please contact us at:</p>
            <div className="text-[#2d3748]">
              <p>Email: legal@vitamend.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Healthcare Ave, Medical District, City, State 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
