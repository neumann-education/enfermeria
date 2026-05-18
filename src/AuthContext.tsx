import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type AuthContextType = {
  isLoggedIn: boolean
  isLoading: boolean
  user: string | null
  login: (displayName: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<string | null>(null)

  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn')
    const savedUser = localStorage.getItem('authUser')
    if (savedLoginState === 'true' && savedUser) {
      setIsLoggedIn(true)
      setUser(savedUser)
    }
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString())
    if (user) {
      localStorage.setItem('authUser', user)
    } else {
      localStorage.removeItem('authUser')
    }
  }, [isLoggedIn, user])

  const login = (displayName: string) => {
    setIsLoggedIn(true)
    setUser(displayName)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 800)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('authUser')
  }

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
