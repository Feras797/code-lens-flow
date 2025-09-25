import { createClient } from '@supabase/supabase-js'

// Database types (you can generate these from your Supabase project)
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      facilities: {
        Row: {
          id: string
          company_id: string
          name: string
          location_name: string
          latitude: number
          longitude: number
          facility_type: string
          environmental_data: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          location_name: string
          latitude: number
          longitude: number
          facility_type: string
          environmental_data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          location_name?: string
          latitude?: number
          longitude?: number
          facility_type?: string
          environmental_data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      environmental_metrics: {
        Row: {
          id: string
          facility_id: string
          metric_type: string
          value: number
          unit: string
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          metric_type: string
          value: number
          unit: string
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          metric_type?: string
          value?: number
          unit?: string
          recorded_at?: string
          created_at?: string
        }
      }
      reference_patches: {
        Row: {
          id: string
          facility_id: string
          patch_id: string
          similarity_score: number
          latitude: number
          longitude: number
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          patch_id: string
          similarity_score: number
          latitude: number
          longitude: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          patch_id?: string
          similarity_score?: number
          latitude?: number
          longitude?: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          company_id: string
          facility_id: string | null
          report_type: string
          title: string
          content: string | null
          file_url: string | null
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          facility_id?: string | null
          report_type: string
          title: string
          content?: string | null
          file_url?: string | null
          generated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          facility_id?: string | null
          report_type?: string
          title?: string
          content?: string | null
          file_url?: string | null
          generated_at?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a dummy client that will fail gracefully if credentials are missing
let supabaseClient: any = null

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please create a .env file in the root directory with:')
  console.error('VITE_SUPABASE_URL=your_supabase_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_anon_key')
  
  // Create a mock client that will throw errors when accessed
  supabaseClient = new Proxy({}, {
    get: () => {
      throw new Error('Supabase client not initialized. Please configure your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
  })
} else {
  // Create real Supabase client
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

export const supabase = supabaseClient

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error)
  
  if (error?.message) {
    return error.message
  }
  
  if (error?.code) {
    switch (error.code) {
      case 'PGRST301':
        return 'Authentication required'
      case '23505':
        return 'This record already exists'
      case '23503':
        return 'Referenced record not found'
      default:
        return `Database error: ${error.code}`
    }
  }
  
  return 'An unexpected error occurred'
}
