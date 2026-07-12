import { createContext, useContext, useState, useCallback, useEffect } from 'react'

import api from '../api'

const AuthContext = createContext()

function storeTokens(accessToken, refreshToken) {
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
}

function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const res = await api.get('/auth/me')
        setUser(res.data)
        setIsAuthenticated(true)
      } catch {
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, refresh_token, user: userData } = res.data
    storeTokens(access_token, refresh_token)
    setUser(userData)
    setIsAuthenticated(true)
    return userData
  }, [])

  const signup = useCallback(async (firstName, lastName, email, password, phone) => {
    const payload = { first_name: firstName, last_name: lastName, email, password }
    if (phone) payload.phone = phone
    const res = await api.post('/auth/register', payload)
    const { access_token, refresh_token, user: userData } = res.data
    storeTokens(access_token, refresh_token)
    setUser(userData)
    setIsAuthenticated(true)
    return userData
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
