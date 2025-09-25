import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthUser, getCurrentUser } from '../lib/auth'

type AuthContextType = {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user data
  const fetchUser = async () => {
    const userData = await getCurrentUser()
    setUser(userData)
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        
        if (initialSession) {
          await fetchUser()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event)
        setSession(currentSession)
        
        if (currentSession) {
          await fetchUser()
        } else {
          setUser(null)
        }
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.session) {
        setSession(data.session)
        await fetchUser()
      }
      
      return { error: null }
    } catch (error: any) {
      return { error: error.message || 'Failed to sign in' }
    }
  }

  // Sign up
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) throw error
      
      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: 'viewer'
          })
        
        if (profileError && profileError.code !== '23505') {
          console.error('Error creating user profile:', profileError)
        }
      }
      
      return { error: null }
    } catch (error: any) {
      return { error: error.message || 'Failed to sign up' }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    if (session) {
      await fetchUser()
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
