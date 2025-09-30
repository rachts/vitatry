export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-[#f8faff]">
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-[#1a472a] mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">1. Information We Collect</h2>
            <div className="text-[#2d3748] space-y-4">
              <p>
                <strong>Personal Information:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, phone number</li>
                <li>Address for medicine pickup/delivery</li>
                <li>Account credentials and preferences</li>
                <li>Volunteer application information</li>
              </ul>

              <p>
                <strong>Donation Information:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Medicine details (name, quantity, expiry date)</li>
                <li>Photos of medicine packaging (if provided)</li>
                <li>Donation history and status updates</li>
              </ul>

              <p>
                <strong>Technical Information:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address, browser type, device information</li>
                <li>Usage patterns and platform interactions</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">2. How We Use Your Information</h2>
            <div className="text-[#2d3748] space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and verify medicine donations</li>
                <li>Coordinate pickup and distribution logistics</li>
                <li>Send updates about donation status and impact</li>
                <li>Improve our platform and services</li>
                <li>Ensure compliance with healthcare regulations</li>
                <li>Generate anonymized impact reports</li>
                <li>Prevent fraud and maintain platform security</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibent text-[#1a472a] mb-4">3. Information Sharing</h2>
            <div className="text-[#2d3748] space-y-4">
              <p>
                <strong>We share information with:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verified partner organizations for medicine distribution</li>
                <li>Licensed pharmacists for verification purposes</li>
                <li>Volunteers for collection and logistics (limited information)</li>
                <li>Service providers who assist with platform operations</li>
                <li>Regulatory authorities when required by law</li>
              </ul>

              <p>
                <strong>We do NOT:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sell personal information to third parties</li>
                <li>Share information for marketing purposes without consent</li>
                <li>Disclose sensitive health information unnecessarily</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">4. Data Security</h2>
            <p className="text-[#2d3748] mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#2d3748]">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure data centers with physical security measures</li>
              <li>Employee training on data protection practices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">5. Your Rights</h2>
            <div className="text-[#2d3748] space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>Request data portability</li>
                <li>Object to certain data processing activities</li>
              </ul>

              <p>To exercise these rights, contact us at privacy@vitamend.com</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">6. Cookies and Tracking</h2>
            <p className="text-[#2d3748] mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#2d3748]">
              <li>Remember your preferences and login status</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized content and features</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
            <p className="text-[#2d3748] mt-4">You can control cookie settings through your browser preferences.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">7. Data Retention</h2>
            <p className="text-[#2d3748] mb-4">We retain personal information for as long as necessary to:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#2d3748]">
              <li>Provide our services and support</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain accurate impact and audit records</li>
            </ul>
            <p className="text-[#2d3748] mt-4">
              Donation records are typically retained for 7 years for regulatory compliance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">8. International Transfers</h2>
            <p className="text-[#2d3748] mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure
              appropriate safeguards are in place to protect your data during international transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">9. Children's Privacy</h2>
            <p className="text-[#2d3748] mb-4">
              Our platform is not intended for children under 13. We do not knowingly collect personal information from
              children under 13. If we become aware of such collection, we will delete the information immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">10. Changes to This Policy</h2>
            <p className="text-[#2d3748] mb-4">
              We may update this Privacy Policy periodically. We will notify users of significant changes via email or
              platform notifications. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1a472a] mb-4">11. Contact Us</h2>
            <p className="text-[#2d3748] mb-4">For questions about this Privacy Policy or our data practices:</p>
            <div className="text-[#2d3748]">
              <p>Email: privacy@vitamend.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: 123 Healthcare Ave, Medical District, City, State 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
