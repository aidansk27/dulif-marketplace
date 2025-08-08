'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'terms' | 'privacy'
}

export const TermsModal = ({ isOpen, onClose, defaultTab = 'terms' }: TermsModalProps) => {
  const MotionDiv = motion.div as React.ElementType
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab)
    }
  }, [isOpen, defaultTab])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl berkeley-card rounded-3xl berkeley-glow overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <Logo size="lg" variant="horizontal" />
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6 text-muted" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-primary-50 rounded-xl p-1 border border-primary-100">
                <button
                  onClick={() => setActiveTab('terms')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'terms'
                      ? 'bg-primary text-white border border-primary shadow'
                      : 'bg-white text-primary border border-primary/40 hover:bg-primary hover:text-white hover:border-primary'
                  }`}
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'privacy'
                      ? 'bg-primary text-white border border-primary shadow'
                      : 'bg-white text-primary border border-primary/40 hover:bg-primary hover:text-white hover:border-primary'
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
                  <MotionDiv
                    key="terms"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="prose prose-sm max-w-none"
                  >
                    <h2 className="text-xl font-bold text-foreground mb-4">dulif — Terms of Service</h2>
                    <p className="text-sm text-muted mb-4">Last updated: August 6 2025</p>

                    <div className="space-y-6 text-sm text-foreground">
                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Agreement to Terms</h3>
                        <p className="mb-3">
                          Accessing or using the dulif marketplace (&quot;Service&quot;) forms a binding contract between you and dulif Inc. (&quot;dulif,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;). If you disagree with any part of the Terms, discontinue use immediately.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Changes to Terms</h3>
                        <p className="mb-3">
                          We may revise these Terms at any time. Continued use after the &quot;Last updated&quot; date constitutes acceptance of the revised Terms.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Eligibility & Account Integrity</h3>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>Must hold an active @berkeley.edu email address and be at least 18 years old (or have guardian consent).</li>
                          <li>One account per individual; credentials are non-transferable.</li>
                          <li>You are solely responsible for activity under your account and for promptly notifying dulif of any breach.</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Marketplace Relationship</h3>
                        <p className="mb-3">
                          dulif provides a platform that enables users to list, discover, and arrange peer-to-peer transactions. We are not a party to any sale, purchase, exchange, meeting, or dispute arising between users. All risk, inspection, payment, and fulfilment obligations rest exclusively with the transacting parties.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">User-Generated Content & License</h3>
                        <p className="mb-2">By posting text, images, ratings, or other content (&quot;User Content&quot;) you</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>grant dulif a worldwide, royalty-free, sublicensable licence to host, use, reproduce, modify, distribute, and display such User Content for operating and improving the Service;</li>
                          <li>warrant that you own or have rights to the User Content; and</li>
                          <li>acknowledge that removal from public view may not delete residual copies from backups or legal archives.</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Prohibited Items & Conduct</h3>
                        <p className="mb-2">You agree not to:</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>list items whose sale or possession is illegal, regulated, dangerous, or infringes intellectual property;</li>
                          <li>impersonate, harass, spam, data-mine, reverse-engineer, or otherwise interfere with the Service;</li>
                          <li>use dulif for commercial bulk-selling, recruitment, or any non-student activity without prior written consent.</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Fees & Taxes</h3>
                        <p className="mb-3">
                          Posting is free unless a feature or category is explicitly marked &quot;paid.&quot; We may introduce or modify fees with 14 days&apos; notice. Users are responsible for all applicable taxes and regulatory reporting.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Safety Guidelines</h3>
                        <p className="mb-3">
                          Meet only in well-lit public areas on or near campus, verify item condition before payment, and avoid cash beyond minor transactions—use digital methods where possible. dulif does not conduct background checks and makes no representations regarding the identity, intentions, or legality of users.
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Contact</h3>
                        <p className="mb-3">
                          team@dulif.com • 2150 Shattuck Ave, Suite 200, Berkeley CA 94704
                        </p>
                      </section>
                    </div>
                  </MotionDiv>
                ) : (
                  <MotionDiv
                    key="privacy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="prose prose-sm max-w-none"
                  >
                    <h2 className="text-xl font-bold text-foreground mb-4">dulif — Privacy Policy</h2>
                    <p className="text-sm text-muted mb-4">Last updated: August 6 2025</p>

                    <div className="space-y-6 text-sm text-foreground">
                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Scope</h3>
                        <p className="mb-3">
                          This Policy explains how dulif collects, uses, discloses, and secures information when you access our website, mobile application, or related services (&quot;Service&quot;).
                        </p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Information We Collect</h3>
                        <div className="mb-3">
                          <table className="w-full border-collapse border border-gray-300 text-xs">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border border-gray-300 p-2 text-left font-semibold">Category</th>
                                <th className="border border-gray-300 p-2 text-left font-semibold">Examples</th>
                                <th className="border border-gray-300 p-2 text-left font-semibold">Source</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 p-2">Account Data</td>
                                <td className="border border-gray-300 p-2">Berkeley email, name, profile photo</td>
                                <td className="border border-gray-300 p-2">You</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 p-2">Listing Data</td>
                                <td className="border border-gray-300 p-2">Item descriptions, prices, images</td>
                                <td className="border border-gray-300 p-2">You</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 p-2">Transaction Data</td>
                                <td className="border border-gray-300 p-2">Messages, offers, ratings, timestamps</td>
                                <td className="border border-gray-300 p-2">You & counterparties</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 p-2">Device & Usage Data</td>
                                <td className="border border-gray-300 p-2">IP address, browser type, device identifiers, crash logs, interaction metrics</td>
                                <td className="border border-gray-300 p-2">Automatic</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 p-2">Location Data</td>
                                <td className="border border-gray-300 p-2">Approximate geolocation from IP or user input</td>
                                <td className="border border-gray-300 p-2">Automatic/You</td>
                              </tr>
                              <tr>
                                <td className="border border-gray-300 p-2">Cookies & Similar Tech</td>
                                <td className="border border-gray-300 p-2">Session tokens, analytics identifiers</td>
                                <td className="border border-gray-300 p-2">Automatic</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">How We Use Information</h3>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>Create, verify, and maintain accounts</li>
                          <li>Facilitate listings, messaging, and transactions</li>
                          <li>Detect, investigate, and prevent fraud, harassment, and security incidents</li>
                          <li>Improve and develop products, features, and analytics</li>
                          <li>Send transactional notices and critical updates</li>
                          <li>Comply with legal obligations and enforce rights</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Sharing of Information</h3>
                        <p className="mb-2">We do not sell personal data. We share only:</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li><strong>With other users:</strong> limited profile, item, and chat data necessary for transactions.</li>
                          <li><strong>With service providers:</strong> cloud hosting, payment processors, analytics, email delivery—all contractually bound to confidentiality.</li>
                          <li><strong>For legal reasons:</strong> governmental requests, court orders, or to investigate violations.</li>
                          <li><strong>Corporate events:</strong> merger, acquisition, or asset sale, provided successor continues comparable protections.</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Your Rights</h3>
                        <p className="mb-2">Subject to verification, you may:</p>
                        <ul className="list-disc list-inside space-y-2 mb-3">
                          <li>Access and correct your data via account settings.</li>
                          <li>Delete your account, triggering deletion or anonymization of associated data not required for legal or security purposes.</li>
                          <li>Object to or restrict processing in certain circumstances.</li>
                          <li>Opt out of non-essential notifications.</li>
                        </ul>
                        <p className="mb-3">Requests: team@dulif.com.</p>
                      </section>

                      <section>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Contact</h3>
                        <p className="mb-3">
                          team@dulif.com • 2150 Shattuck Ave, Suite 200, Berkeley CA 94704
                        </p>
                      </section>
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted">
                  Need help? Email <a href="mailto:team@dulif.com" className="text-primary hover:underline">team@dulif.com</a>
                </div>
                <Button onClick={onClose} variant="primary" className="px-6">
                  Back to Sign Up
                </Button>
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </AnimatePresence>
  )
}