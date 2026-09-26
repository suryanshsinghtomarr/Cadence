import { createContext, useContext, useMemo, useState } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'planner_user'
const TOKEN_KEY = 'token'

const getInitialSession = () => {
  const rawUser = localStorage.getItem(SESSION_KEY)
  const rawToken = localStorage.getItem(TOKEN_KEY)
  return {
    user: rawUser ? JSON.parse(rawUser) : null,
    token: rawToken || '',
  }
}

export function AuthProvider({ children }) {
  const initialSession = getInitialSession()
  const [user, setUser] = useState(initialSession.user)
  const [token, setToken] = useState(initialSession.token)

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password })

      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_KEY, data.token)
      sessionStorage.removeItem('hasAnimatedDashboard')
      setUser(data.user)
      setToken(data.token)
      return data
    } catch (error) {
      console.error('Login request failed:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || error.message || 'Login failed', {
        cause: error,
      })
    }
  }

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password })

      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_KEY, data.token)
      sessionStorage.removeItem('hasAnimatedDashboard')
      setUser(data.user)
      setToken(data.token)
      return data
    } catch (error) {
      console.error('Registration request failed:', error.response?.data || error.message)
      throw new Error(
        error.response?.data?.message || error.message || 'Registration failed',
        { cause: error },
      )
    }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem('hasAnimatedDashboard')
    setUser(null)
    setToken('')
  }

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
    }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
