'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push('/');
    }
  }, [session, router]);

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 py-4 px-6 sticky top-0 z-50 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider cursor-pointer hover:text-gray-400 transition" onClick={() => router.push('/')}>UnSaid</h1>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Profile Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-12 mb-12">
          <div className="flex items-center gap-8 mb-8">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
              />
            )}
            <div>
              <h1 className="text-5xl font-bold mb-2">{session.user.name}</h1>
              <p className="text-gray-400 text-xl">{session.user.email}</p>
              <div className="mt-6 flex gap-4">
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Confessions Sent</p>
                  <p className="text-3xl font-bold text-blue-400">0</p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Subscription</p>
                  <p className="text-3xl font-bold text-purple-400">None</p>
                </div>
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Account Status</p>
                  <p className="text-3xl font-bold text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Recent Activity */}
          <div className="border border-gray-800 rounded-lg p-8 bg-gray-950">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-gray-300">No confessions sent yet</p>
                <p className="text-gray-500 text-sm">Get a subscription to start sending</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="border border-gray-800 rounded-lg p-8 bg-gray-950">
            <h2 className="text-2xl font-bold mb-6">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Email Verified</label>
                <p className="text-gray-200">✅ Yes</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Sign In Method</label>
                <p className="text-gray-200">Google OAuth</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Account Created</label>
                <p className="text-gray-200">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-8">
          <a
            href="/#pricing"
            className="border border-gray-800 rounded-lg p-8 bg-gray-950 hover:border-blue-500 hover:bg-gray-900 transition text-center"
          >
            <h3 className="text-xl font-bold mb-2">Get a Subscription</h3>
            <p className="text-gray-400 mb-4">Unlock unlimited confessions</p>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
              View Plans
            </button>
          </a>

          <div className="border border-gray-800 rounded-lg p-8 bg-gray-950">
            <h3 className="text-xl font-bold mb-2">Need Help?</h3>
            <p className="text-gray-400 mb-4">Have questions about UnSaid?</p>
            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 bg-black text-center text-gray-500 text-sm mt-12">
        <p>© 2025 UnSaid. Where honesty lives.</p>
      </footer>
    </div>
  );
}
