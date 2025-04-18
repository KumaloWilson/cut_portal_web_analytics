"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { API_BASE_URL } from "./api"

interface Admin {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  admin: Admin | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  registerAdmin: (username: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchCurrentAdmin(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Fetch current admin data
  const fetchCurrentAdmin = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      setAdmin(response.data.admin)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching admin data:", error)
      logout()
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      const { token: authToken, admin: adminData } = response.data

      // Save token to localStorage
      localStorage.setItem("token", authToken)

      // Update state
      setToken(authToken)
      setAdmin(adminData)

      // Configure axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`

      setIsLoading(false)

      // Redirect to dashboard
      router.push("/")
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setAdmin(null)
    delete axios.defaults.headers.common["Authorization"]
    router.push("/login")
  }

  // Register admin function
  const registerAdmin = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      await axios.post(
        `${API_BASE_URL}/auth/register`,
        { username, email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
        registerAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
