'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('submissionId')

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="glass p-8 md:p-12">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-400 mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Confession sent! 🎉</h1>
          <p className="text-lg text-gray-300 mb-8">
            Your message is on its way and will be delivered anonymously.
          </p>

          {/* Submission ID */}
          {submissionId && (
            <div className="bg-white/5 border border-gray-600 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-400">Reference ID</p>
              <p className="text-green-400 font-mono text-sm break-all">{submissionId}</p>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">📬 What happens next:</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-xl">⏱️</span>
                <div>
                  <p className="text-white font-semibold">Delivery in progress</p>
                  <p className="text-sm text-gray-400">Email: within 5 minutes | WhatsApp: within 1 hour</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <p className="text-white font-semibold">Sent anonymously</p>
                  <p className="text-sm text-gray-400">They won't know who you are - ever</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-xl">💭</span>
                <div>
                  <p className="text-white font-semibold">Check for replies</p>
                  <p className="text-sm text-gray-400">If they respond, it'll appear in your profile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-900/10 border border-blue-700/30 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-200">
              <span className="font-semibold">💡 Tip:</span> Check your profile later to see if you've received any replies. Each confession creates a channel of anonymous conversation.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/profile"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition text-center"
            >
              View Your Profile
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition text-center"
            >
              Send Another Confession
            </Link>
          </div>

          {/* Additional Info */}
          <p className="text-center text-sm text-gray-400 mt-8">
            Need help? <Link href="/contact" className="text-blue-400 hover:text-blue-300">Contact support</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function Success() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
