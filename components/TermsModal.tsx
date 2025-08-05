'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TermsModal = ({ isOpen, onClose }: TermsModalProps) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl berkeley-card rounded-3xl berkeley-glow overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    dulif™
                  </h1>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6 text-muted" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'terms'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'privacy'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'terms' ? (
                  <motion.div
                    key="terms"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="prose prose-sm max-w-none"
                  >
                    <h2 className="text-xl font-bold text-foreground mb-4">Terms of Service</h2>
                    <p className="text-sm text-muted mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-sm text-foreground">
                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">1. Acceptance of Terms</h3>
                        <p className="mb-3">
                          By accessing and using dulif™ ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">2. Eligibility</h3>
                        <p className="mb-3">
                          dulif™ is exclusively available to current UC Berkeley students with valid @berkeley.edu email addresses. You must be at least 18 years old or have parental consent to use this service.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">3. Account Responsibilities</h3>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>Maintain accurate and current information</li>
                          <li>Keep your account secure and confidential</li>
                          <li>Use only your own UC Berkeley email address</li>
                          <li>Report any unauthorized use immediately</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">4. Marketplace Guidelines</h3>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>All listings must be accurate and truthful</li>
                          <li>No prohibited items (illegal, dangerous, or restricted goods)</li>
                          <li>Respect other users and maintain professionalism</li>
                          <li>Complete transactions in good faith</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">5. Safety & Security</h3>
                        <p className="mb-2">For your safety:</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>Always meet in public, well-lit areas on or near campus</li>
                          <li>Bring a friend when meeting strangers</li>
                          <li>Trust your instincts - if something feels wrong, walk away</li>
                          <li>Inspect items thoroughly before purchasing</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">6. Prohibited Conduct</h3>
                        <p className="mb-3">
                          Users may not engage in fraud, harassment, spam, or any illegal activities. dulif™ reserves the right to suspend or terminate accounts that violate these terms.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">7. Contact Information</h3>
                        <p className="mb-3">
                          For questions or support, contact us at: <a href="mailto:support@dulif.com" className="text-primary hover:underline">support@dulif.com</a>
                        </p>
                      </section>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="prose prose-sm max-w-none"
                  >
                    <h2 className="text-xl font-bold text-foreground mb-4">Privacy Policy</h2>
                    <p className="text-sm text-muted mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="space-y-6 text-sm text-foreground">
                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">1. Information We Collect</h3>
                        <p className="mb-3">
                          We collect information you provide directly to us, such as when you create an account, make a listing, or contact other users.
                        </p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>UC Berkeley email address (for verification)</li>
                          <li>Profile information (name, photo)</li>
                          <li>Listing details and photos</li>
                          <li>Chat messages between users</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">2. How We Use Your Information</h3>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>Provide and maintain our marketplace service</li>
                          <li>Verify your UC Berkeley student status</li>
                          <li>Enable communication between buyers and sellers</li>
                          <li>Ensure platform safety and security</li>
                          <li>Send important service notifications</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">3. Information Sharing</h3>
                        <p className="mb-3">
                          We do not sell or rent your personal information to third parties. We may share information only in these circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>With other users as part of marketplace functionality</li>
                          <li>When required by law or to protect our rights</li>
                          <li>With service providers who help operate our platform</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">4. Data Security</h3>
                        <p className="mb-3">
                          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">5. Your Rights</h3>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>Access and update your account information</li>
                          <li>Delete your account and associated data</li>
                          <li>Control your privacy settings</li>
                          <li>Opt out of non-essential communications</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">6. UC Berkeley Affiliation</h3>
                        <p className="mb-3">
                          dulif™ is an independent student marketplace and is not officially affiliated with or endorsed by UC Berkeley.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">7. Contact Us</h3>
                        <p className="mb-3">
                          If you have questions about this Privacy Policy, please contact us at: <a href="mailto:support@dulif.com" className="text-primary hover:underline">support@dulif.com</a>
                        </p>
                      </section>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted">
                  Need help? Email <a href="mailto:support@dulif.com" className="text-primary hover:underline">support@dulif.com</a>
                </div>
                <Button
                  onClick={onClose}
                  className="px-6"
                >
                  Back to Sign Up
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}