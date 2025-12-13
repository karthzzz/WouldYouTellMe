/**
 * Utility functions for form handling and validation
 */

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic validation for Indian phone numbers
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned
}

export const getPlanDetails = (plan: 'anonymous' | 'reveal') => {
  const plans = {
    anonymous: {
      name: 'Anonymous Only',
      price: 499,
      priceInPaise: 49900,
      description: 'Your identity stays completely hidden',
      icon: '👤',
    },
    reveal: {
      name: 'Reveal After 7 Days',
      price: 999,
      priceInPaise: 99900,
      description: 'Your identity is revealed after 7 days',
      icon: '⏰',
    },
  }
  return plans[plan]
}
