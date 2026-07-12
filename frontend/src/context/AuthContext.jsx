import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = useCallback((email, password) => {
    setIsLoading(true)
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0],
          role: 'employee',
          department: 'Engineering',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        }
        setUser(mockUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        resolve(mockUser)
      }, 1000)
    })
  }, [])

  const signup = useCallback((email, password, name) => {
    setIsLoading(true)
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          role: 'employee',
          department: 'New Department',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        }
        setUser(mockUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        resolve(mockUser)
      }, 1000)
    })
  }, [])

  const oauthLogin = useCallback((provider) => {
    setIsLoading(true)
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: `user@${provider}.com`,
          name: `OAuth User`,
          role: 'employee',
          department: 'Engineering',
          provider,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`
        }
        setUser(mockUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        resolve(mockUser)
      }, 1500)
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      signup,
      oauthLogin,
      logout
    }}>
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
