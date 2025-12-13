'use client'

import { useEffect, useState } from 'react'

interface PaymentButtonProps {
  amount: number
  plan: 'anonymous' | 'reveal'
  onSuccess: (paymentId: string) => void
  loading?: boolean
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function PaymentButton({ amount, plan, onSuccess, loading = false }: PaymentButtonProps) {
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handlePayment = async () => {
    if (processing) return

    setProcessing(true)

    try {
      // Create order on backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, plan }),
      })

      const { id: orderId } = await response.json()

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount,
        currency: 'INR',
        name: 'UnSaid',
        description: plan === 'anonymous' ? 'Anonymous Confession' : 'Timed Reveal Confession',
        order_id: orderId,
        handler: (response: any) => {
          onSuccess(response.razorpay_payment_id)
        },
        prefill: {
          name: 'Sender',
          email: 'sender@example.com',
        },
        theme: {
          color: '#a855f7',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const displayAmount = (amount / 100).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Order Summary</h2>
        <div className="flex justify-between text-gray-300 py-2 border-b border-gray-600">
          <span>{plan === 'anonymous' ? 'Anonymous Confession' : 'Timed Reveal Confession'}</span>
          <span>₹{displayAmount}</span>
        </div>
        <div className="flex justify-between text-white font-semibold py-2">
          <span>Total Amount</span>
          <span>₹{displayAmount}</span>
        </div>
      </div>

      <p className="text-gray-300 text-sm">
        {plan === 'anonymous'
          ? 'Your confession will remain completely anonymous.'
          : 'Your identity will be revealed automatically after 7 days.'}
      </p>

      <button
        onClick={handlePayment}
        disabled={processing || loading}
        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {processing || loading ? 'Processing...' : `Pay ₹${displayAmount}`}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Powered by Razorpay. Your payment is secure and encrypted.
      </p>
    </div>
  )
}
