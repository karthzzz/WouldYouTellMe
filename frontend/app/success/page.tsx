'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Success() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('submissionId')

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="glass p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-400">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Success!</h1>
          <p className="text-gray-300 mb-6">
            Your confession has been submitted and payment confirmed.
          </p>

          {submissionId && (
            <div className="bg-white/5 border border-gray-600 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400">Submission ID</p>
              <p className="text-green-400 font-mono text-sm break-all">{submissionId}</p>
            </div>
          )}

          <p className="text-gray-300 mb-8">
            The message will be delivered shortly to the recipient via your selected method.
          </p>

          <Link
            href="/"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            Send Another Confession
          </Link>
        </div>
      </div>
    </main>
  )
}
