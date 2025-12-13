'use client'

import { useForm } from 'react-hook-form'

interface ConfessionFormProps {
  plan: 'anonymous' | 'reveal'
  onSubmit: (data: any) => void
}

interface FormData {
  message: string
  recipientName: string
  recipientContact: string
  contactType: 'whatsapp' | 'email'
}

export function ConfessionForm({ plan, onSubmit }: ConfessionFormProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      contactType: 'whatsapp',
    }
  })

  const contactType = watch('contactType')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-6">
        {plan === 'anonymous' ? 'Send Anonymous Confession' : 'Share Your Secret'}
      </h2>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Your Message
        </label>
        <textarea
          {...register('message', { 
            required: 'Message is required',
            minLength: { value: 10, message: 'Message must be at least 10 characters' },
            maxLength: { value: 2000, message: 'Message must be less than 2000 characters' }
          })}
          placeholder="Write your confession here..."
          className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
          rows={5}
        />
        {errors.message && (
          <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      {/* Recipient Name */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Recipient Name / Nickname
        </label>
        <input
          {...register('recipientName', { 
            required: 'Recipient name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })}
          type="text"
          placeholder="Who is this for?"
          className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
        />
        {errors.recipientName && (
          <p className="text-red-400 text-sm mt-1">{errors.recipientName.message}</p>
        )}
      </div>

      {/* Contact Type */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Delivery Method
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              {...register('contactType')}
              type="radio"
              value="whatsapp"
              className="mr-2"
            />
            <span className="text-gray-200">WhatsApp</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              {...register('contactType')}
              type="radio"
              value="email"
              className="mr-2"
            />
            <span className="text-gray-200">Email</span>
          </label>
        </div>
      </div>

      {/* Recipient Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Recipient {contactType === 'whatsapp' ? 'WhatsApp' : 'Email'}
        </label>
        <input
          {...register('recipientContact', { 
            required: `Recipient ${contactType} is required`,
            pattern: contactType === 'whatsapp' 
              ? { value: /^\+?[1-9]\d{1,14}$/, message: 'Invalid phone number' }
              : { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
          })}
          type={contactType === 'whatsapp' ? 'tel' : 'email'}
          placeholder={contactType === 'whatsapp' ? '+91 9876543210' : 'recipient@example.com'}
          className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
        />
        {errors.recipientContact && (
          <p className="text-red-400 text-sm mt-1">{errors.recipientContact.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
      >
        Continue to Payment
      </button>
    </form>
  )
}
