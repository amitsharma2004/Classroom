import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Manually decode JWT payload (base64 middle part)
  const decodeJwt = (tkn) => {
    try {
      const parts = tkn.split('.')
      if (parts.length !== 3) return null
      const payload = parts[1]
      // Pad base64 string
      const padded = payload + '=='.slice(0, (4 - (payload.length % 4)) % 4)
      const decoded = atob(padded)
      return JSON.parse(decoded)
    } catch {
      return null
    }
  }

  // On mount: load from localStorage and fetch /me to get full user
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('joineazy_token')
      if (storedToken) {
        const decoded = decodeJwt(storedToken)
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setToken(storedToken)
          try {
            const res = await axiosInstance.get('/auth/me')
            setUser(res.data.user)
          } catch {
            localStorage.removeItem('joineazy_token')
            setToken(null)
            setUser(null)
          }
        } else {
          localStorage.removeItem('joineazy_token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('joineazy_token', newToken)
    setToken(newToken)
    setUser(newUser)
    return newUser
  }

  const register = async (name, email, password, role) => {
    const res = await axiosInstance.post('/auth/register', { name, email, password, role })
    const { token: newToken, user: newUser } = res.data
    localStorage.setItem('joineazy_token', newToken)
    setToken(newToken)
    setUser(newUser)
    return newUser
  }

  const logout = () => {
    localStorage.removeItem('joineazy_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext