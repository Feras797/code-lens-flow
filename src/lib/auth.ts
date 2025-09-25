import { supabase, handleSupabaseError } from './supabase'
import { User } from '@supabase/supabase-js'

export type AuthUser = User & {
  full_name?: string
  avatar_url?: string
  role?: string
}

// Sign up a new user
export async function signUp(email: string, password: string, fullName?: string) {
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
    
    // Create user profile in database
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: 'viewer' // Default role
        })
      
      if (profileError && profileError.code !== '23505') {
        console.error('Error creating user profile:', profileError)
      }
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) }
  }
}

// Sign in an existing user
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) }
  }
}

// Sign out the current user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error) }
  }
}

// Get the current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null
    
    // Fetch additional user data from database
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return {
      ...user,
      ...profile
    } as AuthUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: {
  full_name?: string
  avatar_url?: string
}) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) }
  }
}

// Request password reset
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error) }
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    return { error: handleSupabaseError(error) }
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
