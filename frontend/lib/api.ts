'use client'

import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Orders
  createOrder: (amount: number, plan: string) =>
    apiClient.post('/api/orders', { amount, plan }),

  // Submissions
  submitConfession: (data: any) =>
    apiClient.post('/api/submissions', data),

  getSubmission: (submissionId: string) =>
    apiClient.get(`/api/submissions/${submissionId}`),

  // Admin
  getAdminSubmissions: (status?: string) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    return apiClient.get(`/api/admin/submissions?${params.toString()}`)
  },

  markAsDelivered: (submissionId: string) =>
    apiClient.post(`/api/admin/submissions/${submissionId}/deliver`),
}

export default apiClient
