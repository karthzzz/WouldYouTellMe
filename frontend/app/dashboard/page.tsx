'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
      // Refresh confessions every 3 seconds to show status updates
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
      console.log('Loaded confessions:', response.data);
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

      // Reset form
      setMessage('');
      setRecipientName('');
      setRecipientContact('');
      setSubmitted(true);

      // Reload confessions
      loadConfessions();

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting confession:', error);
      alert('Failed to submit confession');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-purple-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              💌 WouldYouTellMe
            </h1>
            <p className="text-sm text-purple-300 mt-1">Share anonymous confessions</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-300">Welcome, {session?.user?.name}!</p>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8 mb-8">
          {/* Stats Cards */}
          <div className="lg:col-span-4 grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700/50">
              <div className="text-3xl font-bold">{confessions.length}</div>
              <p className="text-blue-200 text-sm mt-2">Total Confessions</p>
            </div>
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700/50">
              <div className="text-3xl font-bold">{confessions.filter(c => c.status === 'sent').length}</div>
              <p className="text-green-200 text-sm mt-2">Sent</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-xl p-6 border border-yellow-700/50">
              <div className="text-3xl font-bold">{confessions.filter(c => c.status === 'pending').length}</div>
              <p className="text-yellow-200 text-sm mt-2">Pending</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700/50">
              <div className="text-3xl font-bold">{confessions.filter(c => c.revealed).length}</div>
              <p className="text-purple-200 text-sm mt-2">Revealed</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Submit Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-purple-700/30 rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                New Confession
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-300">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    minLength={10}
                    maxLength={2000}
                    placeholder="Share your honest thoughts..."
                    className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-purple-400 mt-1">
                    {message.length}/2000
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-300">Recipient Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Who is this for?"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-300">Delivery Method</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as 'email' | 'whatsapp')}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="email">📧 Email</option>
                    <option value="whatsapp">📱 WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-300">
                    {contactType === 'email' ? '📧 Email Address' : '📱 Phone Number'}
                  </label>
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={recipientContact}
                    onChange={(e) => setRecipientContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'example@email.com' : '+91 98765 43210'}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Sending...' : '✈️ Send Confession'}
                </button>

                {submitted && (
                  <div className="p-3 bg-green-900/50 border border-green-700/50 text-green-300 rounded-lg text-sm">
                    ✅ Confession sent successfully!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Confessions List */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 border border-purple-700/30 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Your Confessions
                <span className="ml-auto text-lg font-normal text-purple-300">
                  {confessions.length}
                </span>
              </h3>

              {confessionsLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Loading confessions...</p>
                </div>
              ) : confessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No confessions yet. Share your first one! 👆</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {confessions.map((conf) => {
                    const sentDate = new Date(conf.created_at);
                    const isSent = conf.status === 'sent';
                    const isPending = conf.status === 'pending';

                    return (
                      <div
                        key={conf.id}
                        className={`border rounded-lg p-6 transition-all ${
                          isSent
                            ? 'bg-green-900/20 border-green-700/50 hover:bg-green-900/30'
                            : isPending
                            ? 'bg-yellow-900/20 border-yellow-700/50 hover:bg-yellow-900/30'
                            : 'bg-red-900/20 border-red-700/50 hover:bg-red-900/30'
                        }`}
                      >
                        {/* Header with recipient and status */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold text-white">
                                To: {conf.recipient}
                              </h4>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                  isSent
                                    ? 'bg-green-600 text-green-100'
                                    : isPending
                                    ? 'bg-yellow-600 text-yellow-100'
                                    : 'bg-red-600 text-red-100'
                                }`}
                              >
                                {isSent ? '✅ Sent' : isPending ? '⏳ Pending' : '❌ Failed'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              {conf.contact_type === 'email' ? '📧' : '📱'} {conf.contact}
                            </p>
                          </div>
                        </div>

                        {/* Message */}
                        <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/50">
                          <p className="text-gray-200 leading-relaxed italic">"{conf.message}"</p>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Sent On</p>
                            <p className="text-white font-medium">
                              {sentDate.toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {sentDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Method</p>
                            <p className="text-white font-medium">
                              {conf.contact_type === 'email' ? '📧 Email' : '📱 WhatsApp'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Status</p>
                            <p className="text-white font-medium capitalize">
                              {isSent ? '✅ Delivered' : isPending ? '⏳ Sending...' : '❌ Not Sent'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">ID</p>
                            <p className="text-white font-mono text-xs truncate">
                              {conf.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>

                        {/* Revealed Status */}
                        {conf.revealed && (
                          <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <p className="text-sm text-purple-300">
                              🔓 <strong>Identity Revealed</strong> - Recipient knows who sent this
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
