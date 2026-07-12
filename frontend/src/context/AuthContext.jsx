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

const enrichUser = (userData) => {
  if (!userData) return null;
  if (!userData.avatar) {
    const isAdmin = userData.email === 'admin@assetflow.com' || userData.role === 'admin';
    const bg = isAdmin ? '111111' : 'FF5A3C'; 
    
    // Lucide User icon as an SVG data URI
    userData.avatar = `data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='background-color:%23${bg}; padding: 4px;'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E`;
  }
  return userData;
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
        setUser(enrichUser(res.data))
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
    const enrichedUser = enrichUser(userData)
    setUser(enrichedUser)
    setIsAuthenticated(true)
    return enrichedUser
  }, [])

  const signup = useCallback(async (firstName, lastName, email, password, phone) => {
    const payload = { first_name: firstName, last_name: lastName, email, password }
    if (phone) payload.phone = phone
    const res = await api.post('/auth/register', payload)
    const { access_token, refresh_token, user: userData } = res.data
    storeTokens(access_token, refresh_token)
    const enrichedUser = enrichUser(userData)
    setUser(enrichedUser)
    setIsAuthenticated(true)
    return enrichedUser
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
