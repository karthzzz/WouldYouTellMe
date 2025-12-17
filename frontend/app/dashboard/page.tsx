'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Confession {
  id: string;
  message: string;
  recipient: string;
  contact: string;
  contact_type: string;
  status: string;
  created_at: string;
  revealed?: boolean;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'whatsapp'>('email');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confessionsLoading, setConfessionsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session) {
      loadConfessions();
      const interval = setInterval(loadConfessions, 3000);
      return () => clearInterval(interval);
    }
  }, [session, status, router]);

  const loadConfessions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/confessions`,
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );
      setConfessions(response.data.confessions || []);
      setConfessionsLoading(false);
    } catch (error) {
      console.error('Error loading confessions:', error);
      setConfessionsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/confessions`,
        {
          message,
          recipient_name: recipientName,
          recipient_contact: recipientContact,
          contact_type: contactType,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any).accessToken}`,
          },
        }
      );

      setMessage('');
      setRecipientName('');
      setRecipientContact('');
      setContactType('email');
      setSubmitted(true);
      loadConfessions();
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting confession:', error);
      alert('Failed to submit confession');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider hover:opacity-80 transition">
            UnSaid
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/profile" className="text-gray-400 hover:text-white transition">
              Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="mb-20">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 leading-tight">
            What's on your mind?
          </h1>
          <p className="text-lg text-gray-400">
            Share anonymously. No judgment. Just truth.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form - Left Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Your confession
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    minLength={10}
                    maxLength={2000}
                    placeholder="What do you want to say?"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm resize-none"
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {message.length}/2000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    To whom?
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Their name"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    How to send?
                  </label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as 'email' | 'whatsapp')}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    {contactType === 'email' ? 'Email address' : 'Phone number'}
                  </label>
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={recipientContact}
                    onChange={(e) => setRecipientContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'them@email.com' : '+91 98765 43210'}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>

                {submitted && (
                  <div className="p-3 bg-green-900/30 border border-green-700 text-green-300 rounded text-sm">
                    Sent successfully ✓
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Confessions List - Right Side */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Your confessions</h2>
              <p className="text-gray-400 mt-2">{confessions.length} total</p>
            </div>

            {confessionsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : confessions.length === 0 ? (
              <div className="text-center py-20 border border-gray-800 rounded">
                <p className="text-gray-400 text-lg">No confessions yet</p>
                <p className="text-gray-500 text-sm mt-2">Start by sharing your first truth</p>
              </div>
            ) : (
              <div className="space-y-4">
                {confessions.map((conf: Confession) => {
                  const sentDate = new Date(conf.created_at);
                  const isSent = conf.status === 'sent';

                  return (
                    <div
                      key={conf.id}
                      className="border border-gray-800 rounded p-6 hover:border-gray-700 transition bg-gray-900/40"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-white">
                            To: {conf.recipient}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {conf.contact_type === 'email' ? '📧' : '📱'} {conf.contact}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded font-semibold ${
                            isSent
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-yellow-900/30 text-yellow-400'
                          }`}
                        >
                          {isSent ? 'Sent' : 'Pending'}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {conf.message}
                      </p>

                      {/* Details */}
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-4">
                        <span>{sentDate.toLocaleDateString()}</span>
                        <span>ID: {conf.id.substring(0, 8)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
