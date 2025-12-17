'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      const interval = setInterval(loadConfessions, 3000);
      return () => clearInterval(interval);
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
  const sentConfessions = confessions.filter((c) => c.status === 'sent').length;
  const pendingConfessions = confessions.filter((c) => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-wider hover:opacity-80 transition">
            UnSaid
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
              Dashboard
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
        {/* Profile Hero */}
        <div className="mb-20">
          <div className="flex items-end gap-8 mb-8">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'Profile'}
                className="w-32 h-32 rounded-lg border-2 border-purple-500/30"
              />
            )}
            <div>
              <h1 className="text-6xl md:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {session.user.name}
              </h1>
              <p className="text-lg text-gray-400">{session.user.email}</p>
            </div>
          </div>

          {/* Anonymity Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-700/50 mb-12">
            <span className="text-blue-400">🔒</span>
            <p className="text-sm text-blue-300">
              Confessions you receive are sent anonymously. You won't see the sender's identity.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-20 max-w-3xl">
          <div className="border border-gray-800 rounded p-6 bg-gradient-to-br from-purple-900/20 to-transparent">
            <div className="text-5xl font-bold mb-2 text-purple-400">{totalConfessions}</div>
            <p className="text-sm text-gray-500">✉️ Total confessions</p>
          </div>
          <div className="border border-gray-800 rounded p-6 bg-gradient-to-br from-green-900/20 to-transparent">
            <div className="text-5xl font-bold mb-2 text-green-400">{sentConfessions}</div>
            <p className="text-sm text-gray-500">✅ Delivered</p>
          </div>
          <div className="border border-gray-800 rounded p-6 bg-gradient-to-br from-yellow-900/20 to-transparent">
            <div className="text-5xl font-bold mb-2 text-yellow-400">{pendingConfessions}</div>
            <p className="text-sm text-gray-500">⏳ Pending</p>
          </div>
        </div>

        {/* Confessions Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Recent confessions</h2>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : confessions.length === 0 ? (
            <div className="border border-gray-800 rounded p-16 text-center bg-gradient-to-br from-blue-900/10 to-purple-900/10">
              <div className="mb-6">
                <p className="text-6xl mb-4">💬</p>
                <h3 className="text-2xl font-bold text-white mb-2">Waiting for your confessions</h3>
                <p className="text-gray-400 mb-4">
                  When people send you confessions, they'll appear here. They'll always be sent anonymously - you'll never know who they're from.
                </p>
                <p className="text-sm text-gray-500 mb-6">Share the link with friends to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {confessions.slice(0, 5).map((confession) => (
                <div
                  key={confession.id}
                  className="border border-gray-800 rounded p-6 hover:border-gray-700 transition bg-gray-900/40"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">To: {confession.recipient}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(confession.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded font-semibold ${
                        confession.status === 'sent'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}
                    >
                      {confession.status.charAt(0).toUpperCase() + confession.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-3">{confession.message}</p>

                  <p className="text-xs text-gray-500">
                    {confession.contact_type === 'email' ? '📧' : '�'} {confession.contact}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
