import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Terms of Service - DULIF Marketplace',
  description: 'Terms of Service and Privacy Policy for DULIF Marketplace',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center mb-6 text-white/80 hover:text-white">
            <Image
              src="/transdulif.svg"
              alt="DULIF"
              width={120}
              height={32}
              className="h-8 w-auto mr-4 brightness-0 invert"
            />
          </Link>
          <h1 className="text-3xl font-bold">Terms of Service & Privacy Policy</h1>
          <p className="mt-2 text-white/80">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          
          {/* Terms of Service */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Terms of Service</h2>
            
            <h3 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h3>
            <p className="mb-4">
              By accessing and using DULIF Marketplace, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3 className="text-xl font-semibold mb-4">2. Eligibility</h3>
            <p className="mb-4">
              DULIF Marketplace is exclusively for UC Berkeley students, faculty, and staff with valid @berkeley.edu email addresses. 
              By using this service, you represent that you are affiliated with UC Berkeley.
            </p>

            <h3 className="text-xl font-semibold mb-4">3. User Conduct</h3>
            <p className="mb-2">Users agree to:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Provide accurate and truthful information in listings</li>
              <li>Treat all community members with respect</li>
              <li>Meet in safe, public locations (preferably designated safe spots)</li>
              <li>Honor all agreed-upon transactions</li>
              <li>Report suspicious or fraudulent activity</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">4. Prohibited Items</h3>
            <p className="mb-2">The following items are strictly prohibited:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Illegal or controlled substances</li>
              <li>Weapons or dangerous items</li>
              <li>Stolen or counterfeit goods</li>
              <li>Adult content or services</li>
              <li>Items that violate UC Berkeley policies</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">5. Safety Guidelines</h3>
            <p className="mb-2">For your safety:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Always meet in public, well-lit areas</li>
              <li>Use designated safe spots when possible</li>
              <li>Bring a friend when meeting strangers</li>
              <li>Trust your instincts - if something feels wrong, walk away</li>
              <li>Inspect items thoroughly before purchasing</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">6. Limitation of Liability</h3>
            <p className="mb-4">
              DULIF Marketplace serves as a platform to connect buyers and sellers. We are not responsible for the quality, 
              safety, or legality of items listed, the truth or accuracy of listings, or the ability of sellers to sell 
              items or buyers to pay for items.
            </p>

            <h3 className="text-xl font-semibold mb-4">7. Account Termination</h3>
            <p className="mb-4">
              We reserve the right to terminate accounts that violate these terms, engage in fraudulent activity, 
              or pose a risk to the community.
            </p>
          </section>

          {/* Privacy Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Privacy Policy</h2>
            
            <h3 className="text-xl font-semibold mb-4">Information We Collect</h3>
            <p className="mb-2">We collect the following information:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Berkeley email address (for verification)</li>
              <li>First name and last initial</li>
              <li>Optional profile photo</li>
              <li>Listing information and photos</li>
              <li>Messages between users</li>
              <li>Transaction ratings and reviews</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">How We Use Your Information</h3>
            <p className="mb-2">Your information is used to:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Verify your Berkeley affiliation</li>
              <li>Enable buying and selling activities</li>
              <li>Facilitate communication between users</li>
              <li>Maintain community safety and trust</li>
              <li>Improve our services</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">Information Sharing</h3>
            <p className="mb-4">
              We do not sell or share your personal information with third parties. Your name and profile photo 
              may be visible to other users in the context of your listings and transactions.
            </p>

            <h3 className="text-xl font-semibold mb-4">Data Security</h3>
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction.
            </p>

            <h3 className="text-xl font-semibold mb-4">Your Rights</h3>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-6">Contact Us</h2>
            <p className="mb-4">
              If you have questions about these terms or need to report a violation, please contact us at{' '}
              <a href="mailto:support@dulif.berkeley.edu" className="text-primary hover:underline">
                support@dulif.berkeley.edu
              </a>
            </p>
          </section>
        </div>

        {/* Back to App */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Back to DULIF Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}