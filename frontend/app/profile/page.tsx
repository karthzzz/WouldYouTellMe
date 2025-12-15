'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

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

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push('/');
    } else {
      loadConfessions();
    }
  }, [session, router]);

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
      setLoading(false);
    } catch (error) {
      console.error('Error loading confessions:', error);
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  const totalConfessions = confessions.length;
  const sentConfessions = confessions.filter(c => c.status === 'sent').length;
  const pendingConfessions = confessions.filter(c => c.status === 'pending').length;
  const revealedCount = confessions.filter(c => c.revealed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-purple-900/50 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50 py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => router.push('/dashboard')}
          >
            <div className="text-4xl">💌</div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                WouldYouTellMe
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-purple-300 hover:text-purple-200 transition font-medium"
            >
              📊 Dashboard
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
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-700/40 backdrop-blur-xl rounded-3xl p-12 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Profile Image */}
            {session.user.image && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="relative w-40 h-40 rounded-3xl border-4 border-purple-500 shadow-2xl"
                />
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                {session.user.name}
              </h1>
              <p className="text-lg text-purple-300 mb-8">{session.user.email}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
                  <div className="text-2xl font-black text-blue-300">{totalConfessions}</div>
                  <div className="text-xs text-blue-300/60 font-bold mt-2">SENT</div>
                </div>
                <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4">
                  <div className="text-2xl font-black text-green-300">{sentConfessions}</div>
                  <div className="text-xs text-green-300/60 font-bold mt-2">DELIVERED</div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
                  <div className="text-2xl font-black text-yellow-300">{pendingConfessions}</div>
                  <div className="text-xs text-yellow-300/60 font-bold mt-2">PENDING</div>
                </div>
                <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4">
                  <div className="text-2xl font-black text-purple-300">{revealedCount}</div>
                  <div className="text-xs text-purple-300/60 font-bold mt-2">REVEALED</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Account Info */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-700/40 backdrop-blur-xl rounded-2xl p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span>⚙️</span>
              Account
            </h2>
            <div className="space-y-6">
              <div className="border-b border-slate-700/30 pb-4">
                <p className="text-gray-400 text-sm font-bold mb-2">EMAIL VERIFIED</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <span className="text-green-400">✅</span> Verified
                </p>
              </div>
              <div className="border-b border-slate-700/30 pb-4">
                <p className="text-gray-400 text-sm font-bold mb-2">SIGN-IN METHOD</p>
                <p className="text-white font-semibold">Google OAuth</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-bold mb-2">ACCOUNT STATUS</p>
                <p className="text-white font-semibold text-green-400">🟢 Active</p>
              </div>
            </div>
          </div>

          {/* Confession Stats */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-700/40 backdrop-blur-xl rounded-2xl p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span>📈</span>
              Your Stats
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-gray-400 text-sm font-bold">Total Confessions</p>
                  <p className="text-white font-semibold mt-1">{totalConfessions} confessions sent</p>
                </div>
                <div className="text-4xl">💭</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-900/10 rounded-xl border border-green-700/30">
                <div>
                  <p className="text-green-300/70 text-sm font-bold">Successfully Delivered</p>
                  <p className="text-green-300 font-semibold mt-1">{sentConfessions} reached their destination</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-900/10 rounded-xl border border-yellow-700/30">
                <div>
                  <p className="text-yellow-300/70 text-sm font-bold">Awaiting Delivery</p>
                  <p className="text-yellow-300 font-semibold mt-1">{pendingConfessions} on their way</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-900/10 rounded-xl border border-purple-700/30">
                <div>
                  <p className="text-purple-300/70 text-sm font-bold">Identities Revealed</p>
                  <p className="text-purple-300 font-semibold mt-1">{revealedCount} confessions revealed</p>
                </div>
                <div className="text-4xl">🔓</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Confessions */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-purple-700/40 backdrop-blur-xl rounded-2xl p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <span>📋</span>
            Recent Confessions
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple-300/60">Loading confessions...</p>
            </div>
          ) : confessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-purple-300/60 text-lg">No confessions yet</p>
              <p className="text-purple-300/40 mt-2">Go to your dashboard and share your first confession</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {confessions.slice(0, 5).map((conf) => {
                const sentDate = new Date(conf.created_at);
                const isSent = conf.status === 'sent';

                return (
                  <div
                    key={conf.id}
                    className={`border rounded-xl p-5 transition-all ${
                      isSent
                        ? 'bg-green-900/10 border-green-700/40'
                        : 'bg-yellow-900/10 border-yellow-700/40'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">💌 To: {conf.recipient}</h4>
                        <p className="text-gray-300 text-sm italic mb-2">"{conf.message.substring(0, 100)}..."</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📅 {sentDate.toLocaleDateString()}</span>
                          <span>{conf.contact_type === 'email' ? '📧' : '📱'} {conf.contact}</span>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap ${
                          isSent
                            ? 'bg-green-600/30 text-green-300 border border-green-600/50'
                            : 'bg-yellow-600/30 text-yellow-300 border border-yellow-600/50'
                        }`}
                      >
                        {isSent ? '✅ Sent' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
}
