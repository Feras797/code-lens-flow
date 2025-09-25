import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

// Generic hook for Supabase queries
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: result, error: queryError } = await queryFn()
      
      if (queryError) {
        throw queryError
      }
      
      setData(result)
    } catch (err: any) {
      console.error('Query error:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// Hook to fetch all companies
export function useCompanies() {
  return useSupabaseQuery(() =>
    supabase
      .from('companies')
      .select('*')
      .order('name')
  )
}

// Hook to fetch a single company
export function useCompany(companyId: string) {
  return useSupabaseQuery(() =>
    supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single(),
    [companyId]
  )
}

// Hook to fetch facilities for a company
export function useFacilities(companyId?: string) {
  return useSupabaseQuery(() => {
    let query = supabase.from('facilities').select('*')
    
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    return query.order('name')
  }, [companyId])
}

// Hook to fetch environmental metrics
export function useEnvironmentalMetrics(facilityId?: string, limit = 100) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('environmental_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(limit)
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    return query
  }, [facilityId, limit])
}

// Hook to fetch reference patches for a facility
export function useReferencePatches(facilityId: string) {
  return useSupabaseQuery(() =>
    supabase
      .from('reference_patches')
      .select('*')
      .eq('facility_id', facilityId)
      .order('similarity_score', { ascending: false }),
    [facilityId]
  )
}

// Hook to fetch reports
export function useReports(companyId?: string, facilityId?: string) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false })
    
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    return query
  }, [companyId, facilityId])
}

// Hook for real-time subscription to environmental metrics
export function useRealtimeMetrics(facilityId?: string) {
  const [metrics, setMetrics] = useState<any[]>([])
  
  useEffect(() => {
    if (!facilityId) return
    
    // Initial fetch
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('environmental_metrics')
        .select('*')
        .eq('facility_id', facilityId)
        .order('recorded_at', { ascending: false })
        .limit(50)
      
      if (data) {
        setMetrics(data)
      }
    }
    
    fetchInitial()
    
    // Subscribe to changes
    const subscription = supabase
      .channel(`metrics:${facilityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'environmental_metrics',
          filter: `facility_id=eq.${facilityId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMetrics((prev) => [payload.new, ...prev].slice(0, 50))
          } else if (payload.eventType === 'UPDATE') {
            setMetrics((prev) =>
              prev.map((m) => (m.id === payload.new.id ? payload.new : m))
            )
          } else if (payload.eventType === 'DELETE') {
            setMetrics((prev) => prev.filter((m) => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [facilityId])
  
  return metrics
}

// Hook for aggregated environmental data
export function useAggregatedMetrics(facilityId: string, metricType: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return useSupabaseQuery(async () => {
    // This would ideally be a database function or view
    // For now, we'll fetch and aggregate client-side
    const { data, error } = await supabase
      .from('environmental_metrics')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('metric_type', metricType)
      .order('recorded_at')
    
    if (error) return { data: null, error }
    
    // Aggregate data based on period
    // This is a simplified example - you'd want more sophisticated aggregation
    const aggregated = data?.reduce((acc, metric) => {
      const date = new Date(metric.recorded_at)
      let key: string
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7)
          key = `${date.getFullYear()}-W${weekNum}`
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          key = String(date.getFullYear())
          break
        default:
          key = date.toISOString()
      }
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          values: [],
          average: 0,
          min: Infinity,
          max: -Infinity,
          count: 0
        }
      }
      
      acc[key].values.push(metric.value)
      acc[key].count++
      acc[key].min = Math.min(acc[key].min, metric.value)
      acc[key].max = Math.max(acc[key].max, metric.value)
      
      return acc
    }, {} as Record<string, any>)
    
    // Calculate averages
    if (aggregated) {
      Object.values(aggregated).forEach((item: any) => {
        item.average = item.values.reduce((a: number, b: number) => a + b, 0) / item.values.length
      })
    }
    
    return { 
      data: aggregated ? Object.values(aggregated) : null, 
      error: null 
    }
  }, [facilityId, metricType, period])
}

// Hook to create a new company
export function useCreateCompany() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCompany = async (company: {
    name: string
    description?: string
    logo_url?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: createError } = await supabase
        .from('companies')
        .insert(company)
        .select()
        .single()
      
      if (createError) throw createError
      
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to create company')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { createCompany, isLoading, error }
}

// Hook to update environmental metrics
export function useUpdateMetric() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateMetric = async (
    metricId: string,
    updates: { value?: number; unit?: string }
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await supabase
        .from('environmental_metrics')
        .update(updates)
        .eq('id', metricId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to update metric')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { updateMetric, isLoading, error }
}
