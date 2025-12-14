'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConfessionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session && !(session as any).hasSubscription) {
      router.push('/');
    }
  }, [session, status, router]);

  const validateForm = () => {
    if (!message.trim()) {
      setError('Please write a confession message');
      return false;
    }
    if (message.length < 10) {
      setError('Confession must be at least 10 characters');
      return false;
    }
    if (message.length > 2000) {
      setError('Confession cannot exceed 2000 characters');
      return false;
    }
    if (!recipientName.trim()) {
      setError('Please enter recipient name');
      return false;
    }
    if (recipientName.length < 2) {
      setError('Recipient name must be at least 2 characters');
      return false;
    }
    if (!recipientContact.trim()) {
      setError(`Please enter ${contactType === 'email' ? 'email address' : 'phone number'}`);
      return false;
    }
    if (contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientContact)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else {
      const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
      if (!phoneRegex.test(recipientContact)) {
        setError('Please enter a valid phone number');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/confessions`,
        {
          message: message.trim(),
          recipient_name: recipientName.trim(),
          recipient_contact: recipientContact.trim(),
          contact_type: contactType,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      setSubmissionId(response.data.submission_id);
      setMessage('');
      setRecipientName('');
      setRecipientContact('');
      setSubmitted(true);

      // Redirect to success page
      setTimeout(() => {
        router.push(`/success?submissionId=${response.data.submission_id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting confession:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to submit confession. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider hover:text-gray-400 transition">
            UnSaid
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition"
            >
              My Confessions
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Tell Your Truth</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Share what you've been wanting to say. No names. No consequences. Just honesty.
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-400 mb-4">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Confession Submitted!</h2>
                <p className="text-gray-400 mb-6">
                  Your message will be delivered to {recipientName} shortly.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Redirecting you to success page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Message Field */}
                <div>
                  <label className="block text-lg font-semibold mb-3">Your Confession</label>
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      setError('');
                    }}
                    minLength={10}
                    maxLength={2000}
                    placeholder="What have you always wanted to say? Be honest, be raw, be real..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    rows={6}
                    required
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-500">
                      {message.length < 10 ? (
                        <span className="text-red-400">Minimum 10 characters</span>
                      ) : (
                        <span className="text-green-400">Ready to send</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {message.length}/2000
                    </p>
                  </div>
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="block text-lg font-semibold mb-3">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => {
                      setRecipientName(e.target.value);
                      setError('');
                    }}
                    placeholder="Who is this confession for?"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This is only used to identify who receives it. Can be a first name or nickname.
                  </p>
                </div>

                {/* Contact Type & Contact */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold mb-3">How to Send</label>
                    <select
                      value={contactType}
                      onChange={(e) => {
                        setContactType(e.target.value as 'email' | 'whatsapp');
                        setRecipientContact('');
                        setError('');
                      }}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="email">📧 Email</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-3">
                      {contactType === 'email' ? 'Email Address' : 'Phone Number'}
                    </label>
                    <input
                      type={contactType === 'email' ? 'email' : 'tel'}
                      value={recipientContact}
                      onChange={(e) => {
                        setRecipientContact(e.target.value);
                        setError('');
                      }}
                      placeholder={
                        contactType === 'email'
                          ? 'example@email.com'
                          : '+91 98765 43210'
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || message.length < 10}
                  className={`w-full px-6 py-4 font-semibold rounded-lg transition text-lg ${
                    loading || message.length < 10
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          className="opacity-75"
                        />
                      </svg>
                      Sending your confession...
                    </span>
                  ) : (
                    'Send Confession'
                  )}
                </button>

                {/* Info Box */}
                <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-200">
                    ✨ Your confession will be delivered immediately via {contactType === 'email' ? 'email' : 'WhatsApp'}. The recipient won't know it came from you.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Common Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-800 rounded-lg p-6 bg-gray-950">
                <h3 className="font-bold text-lg mb-2">Will they know it's from me?</h3>
                <p className="text-gray-400 text-sm">
                  No. We never include your identity. They'll just see an anonymous confession.
                </p>
              </div>
              <div className="border border-gray-800 rounded-lg p-6 bg-gray-950">
                <h3 className="font-bold text-lg mb-2">When will they receive it?</h3>
                <p className="text-gray-400 text-sm">
                  Within minutes. We deliver immediately to their email or WhatsApp.
                </p>
              </div>
              <div className="border border-gray-800 rounded-lg p-6 bg-gray-950">
                <h3 className="font-bold text-lg mb-2">Can I send multiple confessions?</h3>
                <p className="text-gray-400 text-sm">
                  Yes! With a lifetime subscription, send as many as you want.
                </p>
              </div>
              <div className="border border-gray-800 rounded-lg p-6 bg-gray-950">
                <h3 className="font-bold text-lg mb-2">Is this actually delivered?</h3>
                <p className="text-gray-400 text-sm">
                  Yes. We integrate with real email and WhatsApp systems to deliver your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
