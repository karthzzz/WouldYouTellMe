'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Contact() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In production, send to backend API
    try {
      // Simulate email sending
      console.log('Contact form submitted:', formData);
      setSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

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
            Contact Us
          </h1>
          <p className="text-gray-400">Have a question? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-20">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">📧 Email</h3>
              <p className="text-gray-400">
                <a href="mailto:support@wouldyoutellme.com" className="text-blue-400 hover:text-blue-300">
                  support@wouldyoutellme.com
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">Response time: 24-48 hours</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">🔒 Privacy Issues</h3>
              <p className="text-gray-400">
                <a href="mailto:privacy@wouldyoutellme.com" className="text-blue-400 hover:text-blue-300">
                  privacy@wouldyoutellme.com
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">GDPR & privacy concerns</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">⚖️ Legal Issues</h3>
              <p className="text-gray-400">
                <a href="mailto:legal@wouldyoutellme.com" className="text-blue-400 hover:text-blue-300">
                  legal@wouldyoutellme.com
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">Legal inquiries & takedowns</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">🐛 Report a Bug</h3>
              <p className="text-gray-400">
                <a href="mailto:bugs@wouldyoutellme.com" className="text-blue-400 hover:text-blue-300">
                  bugs@wouldyoutellme.com
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-1">Security & technical issues</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 border border-gray-800 rounded-lg p-8">
              {submitted && (
                <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                  <p className="text-green-200">Thank you! We'll get back to you soon.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  required
                >
                  <option value="">Select a topic...</option>
                  <option value="payment">💳 Payment Issue</option>
                  <option value="delivery">📧 Delivery Issue</option>
                  <option value="account">👤 Account Issue</option>
                  <option value="privacy">🔒 Privacy Concern</option>
                  <option value="bug">🐛 Report a Bug</option>
                  <option value="feedback">💡 Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition ${
                  loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="border-t border-gray-800 pt-12">
          <h2 className="text-3xl font-bold mb-8">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold text-lg text-white mb-3">How long does delivery take?</h3>
              <p className="text-gray-400 text-sm">
                Most confessions are delivered within minutes. Email delivery is usually instant, while WhatsApp may take a few minutes.
              </p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold text-lg text-white mb-3">Will they know it's from me?</h3>
              <p className="text-gray-400 text-sm">
                No. Messages are sent anonymously. The recipient will not see your identity, email, or phone number.
              </p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold text-lg text-white mb-3">Can I get a refund?</h3>
              <p className="text-gray-400 text-sm">
                Lifetime subscriptions are non-refundable. Annual subscriptions can be cancelled anytime and prorated refunds may apply.
              </p>
            </div>

            <div className="border border-gray-800 rounded-lg p-6">
              <h3 className="font-bold text-lg text-white mb-3">Is my data safe?</h3>
              <p className="text-gray-400 text-sm">
                Yes. We use HTTPS encryption and JWT authentication. See our Privacy Policy for details on data protection.
              </p>
            </div>
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
