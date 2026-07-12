import { create } from 'zustand'

import type { Employee } from '@/types'

interface AuthState {
  employee: Employee | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (employee: Employee, accessToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  employee: null,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (employee, accessToken) => {
    localStorage.setItem('access_token', accessToken)
    set({ employee, accessToken, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('access_token')
    set({ employee: null, accessToken: null, isAuthenticated: false })
  },
}))
