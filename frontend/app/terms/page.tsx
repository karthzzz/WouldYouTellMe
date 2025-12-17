'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-gray-400">Last updated: December 2025</p>
        </div>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using the UnSaid platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on UnSaid's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on UnSaid's website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
            <p>
              The materials on UnSaid's website are provided on an 'as is' basis. UnSaid makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitations of Liability</h2>
            <p>
              In no event shall UnSaid or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on UnSaid's website, even if UnSaid or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on UnSaid's website could include technical, typographical, or photographic errors. UnSaid does not warrant that any of the materials on its website are accurate, complete, or current. UnSaid may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Materials & Content</h2>
            <p>
              UnSaid has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by UnSaid of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Modifications</h2>
            <p>
              UnSaid may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. User Conduct & Content</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">9.1 Prohibited Content</h3>
            <p>
              Users agree not to submit content that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of privacy</li>
              <li>Constitutes harassment, harassment or bullying</li>
              <li>Solicits passwords or personal information for commercial or unlawful purposes</li>
              <li>Infringes upon intellectual property rights</li>
              <li>Contains malware, spyware, or any harmful software</li>
              <li>Is used for blackmail, extortion, or revenge</li>
              <li>Violates any law or regulation</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.2 User Responsibility</h3>
            <p>
              You are solely responsible for the content you submit through UnSaid. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You own or have rights to the content you submit</li>
              <li>Your content does not violate anyone's rights</li>
              <li>You understand the potential consequences of sending confessions</li>
              <li>UnSaid is not liable for how recipients use or respond to your content</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.3 Consequences of Violations</h3>
            <p>
              UnSaid reserves the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Remove content that violates these terms</li>
              <li>Suspend or terminate your account</li>
              <li>Report illegal activity to authorities</li>
              <li>Cooperate with law enforcement investigations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Anonymity Limitations</h2>
            <p className="text-yellow-400 bg-yellow-900/20 p-4 rounded">
              ⚠️ <strong>Important:</strong> While UnSaid provides anonymous message delivery to recipients, your identity is NOT unbreakable. UnSaid may be compelled to disclose your identity to law enforcement if required by legal process, court order, or subpoena. By using this service, you acknowledge this limitation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Subscription & Payment</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">11.1 Subscription Plans</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Lifetime:</strong> One-time payment, unlimited confessions</li>
              <li><strong>Premium Annual:</strong> Annual renewal required, unlimited confessions</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">11.2 Payment Terms</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Payments are processed through Razorpay</li>
              <li>All prices are in INR unless otherwise stated</li>
              <li>Refund policy: No refunds for lifetime subscriptions; annual subscriptions follow our refund policy</li>
              <li>Cancellation: You may cancel anytime via your account settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">11.3 Billing</h3>
            <p>
              By providing payment information, you authorize UnSaid and its payment processor to charge your account. You agree to pay all charges incurred by your account at the rates in effect when the charges are incurred.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Account Termination</h2>
            <p>
              UnSaid may terminate your account and access to the Service at any time, without cause or notice, if you violate these Terms. Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your account access will be immediately disabled</li>
              <li>You remain liable for all charges incurred prior to termination</li>
              <li>Your confessions and data will be retained as per our Privacy Policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. No Liability for Third-Party Conduct</h2>
            <p>
              UnSaid is not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>How recipients respond to or use your confessions</li>
              <li>Any consequences resulting from your confessions</li>
              <li>Actions taken by recipients based on your message</li>
              <li>Third-party websites or services linked from UnSaid</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless UnSaid and its officers, directors, employees, agents, and successors from any and all claims, demands, liabilities, damages, or costs arising from your use of the Service or violation of these Terms, including legal fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. Entire Agreement</h2>
            <p>
              These Terms of Service and Privacy Policy constitute the entire agreement between you and UnSaid regarding your use of the Service and supersede all prior agreements, understandings, and negotiations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. Contact</h2>
            <p>
              For questions about these Terms of Service, contact us at:
            </p>
            <div className="bg-gray-900 p-6 rounded mt-4">
              <p><strong>Email:</strong> <a href="mailto:legal@wouldyoutellme.com" className="text-blue-400 hover:text-blue-300">legal@wouldyoutellme.com</a></p>
              <p><strong>Website:</strong> wouldyoutellme.com</p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-8 mt-12">
            <p className="text-gray-500 text-sm">
              By using UnSaid, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
