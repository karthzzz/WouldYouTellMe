'use client'

import Link from 'next/link'

export default function Failure() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="glass p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-400">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-gray-300 mb-8">
            Something went wrong while processing your payment. Please try again.
          </p>

          <Link
            href="/"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
