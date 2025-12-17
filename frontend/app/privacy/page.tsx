'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function PrivacyPolicy() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider hover:opacity-80 transition">
            UnSaid
          </Link>
          <div className="flex items-center gap-6">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/" className="text-gray-400 hover:text-white transition">
                Home
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last updated: December 2025</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              UnSaid ("we," "us," "our," or "Company") operates the UnSaid platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
            <p className="mt-4">
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> When you sign up via Google OAuth, we collect your email address, name, and profile picture.</li>
              <li><strong>Confession Data:</strong> When you submit a confession, we collect: the message text, recipient name, recipient contact (email or phone), and delivery method preference.</li>
              <li><strong>Device Information:</strong> We collect device IDs to track free message usage per device.</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP address and browser type</li>
              <li>Timestamp of your interactions</li>
              <li>Pages visited and features used</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To deliver confessions to recipients via email or WhatsApp</li>
              <li>To authenticate you and manage your account</li>
              <li>To process payments and subscriptions</li>
              <li>To prevent fraud and abuse</li>
              <li>To track and monitor confession delivery status</li>
              <li>To improve our services and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Anonymity & Recipient Privacy</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">4.1 Sender Anonymity</h3>
            <p>
              Your identity is not visible to the recipient. Confessions are delivered from our system, not from your personal email or phone. The recipient will not see:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Your email address or phone number</li>
              <li>Your name or profile information</li>
              <li>Any identifying information about you</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.2 Recipient Information</h3>
            <p>
              We collect and store recipient contact information (email or phone number) only to deliver your message. We keep this information confidential and separate from your account information. Recipients receive confessions anonymously and do not know who sent them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing & Disclosure</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">5.1 What We Don't Do</h3>
            <p>We do NOT:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sell your personal data to third parties</li>
              <li>Voluntarily disclose your identity to recipients</li>
              <li>Share your data with advertisers or marketing companies</li>
              <li>Use your data for purposes outside of service delivery</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 Legal Disclosure</h3>
            <p className="text-yellow-400 bg-yellow-900/20 p-4 rounded">
              ⚠️ <strong>Important:</strong> We may disclose your information if required by law, court order, or legal process. This includes requests from law enforcement, government agencies, or court subpoenas. We will provide you with notice of such requests unless legally prohibited.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 Service Providers</h3>
            <p>
              We share information with third-party service providers who help us operate our platform:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Brevo:</strong> Email delivery service</li>
              <li><strong>Razorpay:</strong> Payment processing</li>
              <li><strong>Google OAuth:</strong> Authentication</li>
              <li><strong>Twilio:</strong> WhatsApp delivery (if applicable)</li>
            </ul>
            <p className="mt-2">
              These providers are contractually obligated to protect your data and use it only for providing services to us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p>
              We retain your data for the following periods:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> For the duration of your account, and 90 days after deletion</li>
              <li><strong>Confession Data:</strong> Indefinitely (for your records and to track delivery)</li>
              <li><strong>Recipient Contact Info:</strong> For 90 days after delivery</li>
              <li><strong>Payment Information:</strong> As required by law (minimum 7 years for audit purposes)</li>
              <li><strong>Device IDs:</strong> Until you clear your browser cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights & Controls</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">7.1 GDPR & Regional Privacy Rights</h3>
            <p>
              If you are located in the EU or another jurisdiction with privacy laws, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data (right to be forgotten)</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.2 Exercising Your Rights</h3>
            <p>
              To exercise any of these rights, contact us at <a href="mailto:support@wouldyoutellme.com" className="text-blue-400 hover:text-blue-300">support@wouldyoutellme.com</a> with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your email address</li>
              <li>The right you're requesting</li>
              <li>Clear description of your request</li>
            </ul>
            <p className="mt-2">We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>HTTPS encryption for all data in transit</li>
              <li>JWT-based authentication</li>
              <li>Regular security updates and patches</li>
              <li>Database encryption at rest</li>
              <li>Limited access to personal data</li>
            </ul>
            <p className="mt-4 text-yellow-400">
              However, no security system is impenetrable. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Cookies & Tracking</h2>
            <p>
              We use cookies to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Store your device ID for free message tracking</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Links</h2>
            <p>
              Our platform may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before providing your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Children's Privacy</h2>
            <p>
              Our Services are not intended for individuals under 18 years old. We do not knowingly collect information from children under 18. If we discover such information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Significant changes will be communicated via email or prominent notice on our platform. Your continued use of UnSaid constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, contact us at:
            </p>
            <div className="bg-gray-900 p-6 rounded mt-4">
              <p><strong>Email:</strong> <a href="mailto:privacy@wouldyoutellme.com" className="text-blue-400 hover:text-blue-300">privacy@wouldyoutellme.com</a></p>
              <p><strong>Website:</strong> wouldyoutellme.com</p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-8 mt-12">
            <p className="text-gray-500 text-sm">
              By using UnSaid, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 bg-black text-center text-gray-500 text-sm mt-20">
        <p>© 2025 UnSaid. Where honesty lives.</p>
      </footer>
    </div>
  );
}
