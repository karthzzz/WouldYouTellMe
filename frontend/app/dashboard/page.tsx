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
      const response = await axios.post(
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading your confessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Hero Navigation */}
      <nav className="border-b border-purple-900/50 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50 py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl">💌</div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                WouldYouTellMe
              </h1>
              <p className="text-xs text-purple-300/70">Share your truth, stay anonymous</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 text-purple-300 hover:text-purple-200 transition font-medium"
            >
              👤 Profile
            </button>
            <button
              onClick={() => signOut()}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition"
            >
              ⬅️ Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
            Welcome, {session?.user?.name}
          </h2>
          <p className="text-lg text-purple-300/80 max-w-2xl mx-auto">
            Let your thoughts flow freely. Your confessions are anonymous, safe, and delivered with care.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="group bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-2xl p-6 hover:border-blue-600 transition cursor-default">
            <div className="text-4xl mb-2">📬</div>
            <div className="text-sm text-blue-300/70 mb-2">Total Confessions</div>
            <div className="text-4xl font-black text-blue-300">{confessions.length}</div>
          </div>
          <div className="group bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-2xl p-6 hover:border-green-600 transition cursor-default">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-sm text-green-300/70 mb-2">Delivered</div>
            <div className="text-4xl font-black text-green-300">{confessions.filter(c => c.status === 'sent').length}</div>
          </div>
          <div className="group bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-2xl p-6 hover:border-yellow-600 transition cursor-default">
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-sm text-yellow-300/70 mb-2">In Progress</div>
            <div className="text-4xl font-black text-yellow-300">{confessions.filter(c => c.status === 'pending').length}</div>
          </div>
          <div className="group bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-2xl p-6 hover:border-purple-600 transition cursor-default">
            <div className="text-4xl mb-2">🔓</div>
            <div className="text-sm text-purple-300/70 mb-2">Revealed</div>
            <div className="text-4xl font-black text-purple-300">{confessions.filter(c => c.revealed).length}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-purple-700/40 backdrop-blur-xl rounded-2xl p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                  <span className="text-3xl">✍️</span>
                  Confess
                </h3>
                <p className="text-sm text-purple-300/60">Share what's on your heart</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-3 text-purple-300">Your Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    minLength={10}
                    maxLength={2000}
                    placeholder="Write your confession..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm resize-none"
                    rows={5}
                    required
                  />
                  <p className="text-xs text-purple-400/60 mt-2 text-right">
                    {message.length}/2000
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-purple-300">To Whom?</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g., My Best Friend"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-purple-300">How?</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as 'email' | 'whatsapp')}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                  >
                    <option value="email">📧 Email</option>
                    <option value="whatsapp">📱 WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-purple-300">
                    {contactType === 'email' ? '📧 Email' : '📱 Phone'}
                  </label>
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={recipientContact}
                    onChange={(e) => setRecipientContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'their@email.com' : '+91 98765 43210'}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                >
                  {loading ? '📤 Sending...' : '🚀 Send Confession'}
                </button>

                {submitted && (
                  <div className="p-4 bg-green-900/30 border border-green-700/50 text-green-300 rounded-xl text-sm font-medium animate-pulse">
                    ✨ Sent successfully!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Confessions List */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-700/40 backdrop-blur-xl rounded-2xl p-8">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                <span>💭</span>
                Your Confessions
                <span className="ml-auto text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {confessions.length}
                </span>
              </h3>

              {confessionsLoading ? (
                <div className="text-center py-20">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-purple-300/60">Loading your confessions...</p>
                </div>
              ) : confessions.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-purple-300/60 text-lg">No confessions yet</p>
                  <p className="text-purple-300/40 mt-2">Share your first confession and watch it unfold</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {confessions.map((conf) => {
                    const sentDate = new Date(conf.created_at);
                    const isSent = conf.status === 'sent';
                    const isPending = conf.status === 'pending';

                    return (
                      <div
                        key={conf.id}
                        className={`group border rounded-2xl p-6 transition-all ${
                          isSent
                            ? 'bg-green-900/10 border-green-700/40 hover:bg-green-900/20 hover:border-green-600/60'
                            : isPending
                            ? 'bg-yellow-900/10 border-yellow-700/40 hover:bg-yellow-900/20 hover:border-yellow-600/60'
                            : 'bg-red-900/10 border-red-700/40 hover:bg-red-900/20 hover:border-red-600/60'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-white mb-2">
                              💌 To: {conf.recipient}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {conf.contact_type === 'email' ? '📧' : '📱'} {conf.contact}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-4 py-2 rounded-full font-bold whitespace-nowrap ml-4 ${
                              isSent
                                ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                                : isPending
                                ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-600/50'
                                : 'bg-red-600/30 text-red-300 border border-red-600/50'
                            }`}
                          >
                            {isSent ? '✅ Delivered' : isPending ? '⏳ Sending' : '❌ Failed'}
                          </span>
                        </div>

                        {/* Message */}
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 mb-5">
                          <p className="text-gray-100 leading-relaxed italic text-base">
                            "{conf.message}"
                          </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-slate-700/30 pt-5">
                          <div>
                            <p className="text-gray-500 text-xs font-bold mb-2">📅 Date</p>
                            <p className="text-white font-semibold">
                              {sentDate.toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {sentDate.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-bold mb-2">📤 Method</p>
                            <p className="text-white font-semibold">
                              {conf.contact_type === 'email' ? 'Email' : 'WhatsApp'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-bold mb-2">✨ Status</p>
                            <p className="text-white font-semibold capitalize">
                              {isSent ? 'Delivered' : isPending ? 'Sending' : 'Failed'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs font-bold mb-2">🔖 ID</p>
                            <p className="text-white font-mono text-xs font-semibold truncate">
                              {conf.id.substring(0, 12)}...
                            </p>
                          </div>
                        </div>

                        {/* Revealed Badge */}
                        {conf.revealed && (
                          <div className="mt-5 pt-5 border-t border-purple-700/30 flex items-center gap-2">
                            <span className="text-xl">🔓</span>
                            <p className="text-sm text-purple-300">
                              <strong>Identity Revealed</strong> - Recipient knows who you are
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

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}

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
