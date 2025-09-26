import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface DeveloperTask {
  id: string
  title: string
  status: 'high' | 'medium' | 'low'
  description: string
  filePath: string
  timeSpent: string
  commits?: number
  pullRequests?: number
  messages?: number
  startedAt?: string
}

export interface DeveloperStatus {
  id: string
  name: string
  initials: string
  avatar?: string
  status: 'flow' | 'problem_solving' | 'blocked' | 'idle'
  statusMessage: string
  currentTasks: DeveloperTask[]
  totalTasks: number
  completedTasks: number
  lastActive?: string
}

// Hook for fetching real-time team status from Supabase
export function useTeamStatus() {
  const [teamStatus, setTeamStatus] = useState<DeveloperStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch team status from Supabase or use mock data
  const fetchTeamStatus = useCallback(async () => {
    try {
      // Try to fetch from chat_sessions and chat_messages tables if they exist
      const { data: sessions, error: sessionError } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          user:users!user_id (
            id,
            full_name,
            email
          ),
          messages:chat_messages (
            content,
            created_at
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (sessionError) {
        // Fall back to mock data
        console.log('Using mock data for team status')
        setTeamStatus(getMockTeamStatus())
        setIsLoading(false)
        return
      }

      // Transform sessions into team status format
      if (sessions && sessions.length > 0) {
        const developerStatuses = sessions.reduce((acc: DeveloperStatus[], session: any) => {
          const userId = session.user_id
          const existing = acc.find(d => d.id === userId)
          
          if (existing) {
            // Add task to existing developer
            existing.currentTasks.push(convertSessionToTask(session))
            existing.totalTasks++
          } else {
            // Create new developer entry
            acc.push({
              id: userId,
              name: session.user?.full_name || session.user?.email || 'Unknown Developer',
              initials: getInitials(session.user?.full_name || session.user?.email || 'UD'),
              status: determineStatus(session),
              statusMessage: session.context?.current_task || 'Working on project',
              currentTasks: [convertSessionToTask(session)],
              totalTasks: 1,
              completedTasks: 0,
              lastActive: session.updated_at
            })
          }
          
          return acc
        }, [])

        setTeamStatus(developerStatuses)
      } else {
        // No sessions found, use mock data
        setTeamStatus(getMockTeamStatus())
      }
    } catch (err) {
      console.error('Error fetching team status:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch team status')
      // Fall back to mock data on error
      setTeamStatus(getMockTeamStatus())
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchTeamStatus()
  }, [fetchTeamStatus])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('team-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        () => {
          // Refresh team status when sessions change
          fetchTeamStatus()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTeamStatus])

  return {
    teamStatus,
    isLoading,
    error,
    refresh: fetchTeamStatus
  }
}

// Helper functions
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function determineStatus(session: any): DeveloperStatus['status'] {
  // Determine status based on session context or messages
  const recentMessages = session.messages || []
  const hasBlockedKeywords = recentMessages.some((msg: any) => 
    msg.content?.toLowerCase().includes('error') ||
    msg.content?.toLowerCase().includes('stuck') ||
    msg.content?.toLowerCase().includes('help')
  )
  
  if (hasBlockedKeywords) return 'blocked'
  if (recentMessages.length > 5) return 'problem_solving'
  if (recentMessages.length > 0) return 'flow'
  return 'idle'
}

function convertSessionToTask(session: any): DeveloperTask {
  const messages = session.messages || []
  const startTime = new Date(session.created_at).getTime()
  const currentTime = new Date().getTime()
  const timeSpentMs = currentTime - startTime
  const timeSpentMin = Math.floor(timeSpentMs / 60000)
  
  return {
    id: session.id,
    title: session.title || 'Untitled task',
    status: messages.length > 10 ? 'high' : messages.length > 5 ? 'medium' : 'low',
    description: session.context?.description || 'Working on development task',
    filePath: session.context?.current_file || 'src/components/Unknown.tsx',
    timeSpent: timeSpentMin > 60 ? `${Math.floor(timeSpentMin / 60)} hrs` : `${timeSpentMin} min`,
    messages: messages.length,
    startedAt: session.created_at
  }
}

// Mock data generator
function getMockTeamStatus(): DeveloperStatus[] {
  return [
    {
      id: 'sc',
      name: 'Sarah Chen',
      initials: 'SC',
      status: 'flow',
      statusMessage: 'Implementing authentication flow with JWT tokens and refresh mechanism',
      totalTasks: 28,
      completedTasks: 5,
      currentTasks: [
        {
          id: 'jwt-token',
          title: 'JWT token implementation',
          status: 'high',
          description: 'Working on token validation and refresh logic',
          filePath: 'auth/jwt.service.ts',
          timeSpent: '45 min',
          commits: 12,
          pullRequests: 3
        },
        {
          id: 'auth-middleware',
          title: 'Auth middleware setup',
          status: 'medium',
          description: 'Adding route protection and user context',
          filePath: 'middleware/auth.middleware.ts',
          timeSpent: '20 min',
          commits: 8,
          pullRequests: 1
        }
      ]
    },
    {
      id: 'jm',
      name: 'John Martinez',
      initials: 'JM',
      status: 'blocked',
      statusMessage: 'Debugging Stripe webhook integration issues with payment processing failures',
      totalTasks: 72,
      completedTasks: 2,
      currentTasks: [
        {
          id: 'stripe-webhook',
          title: 'Stripe webhook failing',
          status: 'high',
          description: 'Webhook signature verification failing intermittently',
          filePath: 'payments/webhook.handler.ts',
          timeSpent: '2.5 hrs',
          commits: 47,
          pullRequests: 0
        }
      ]
    }
  ]
}

// Hook for updating developer status
export function useUpdateDeveloperStatus() {
  const updateStatus = useCallback(async (
    userId: string,
    status: DeveloperStatus['status'],
    statusMessage?: string
  ) => {
    try {
      // In a real implementation, this would update a developer_status table
      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            current_status: status,
            status_message: statusMessage
          }
        })
        .eq('id', userId)

      if (error) throw error
      return { success: true }
    } catch (err) {
      console.error('Failed to update developer status:', err)
      return { success: false, error: err }
    }
  }, [])

  return { updateStatus }
}

// Hook for real-time task tracking
export function useTaskTracking(developerId: string) {
  const [tasks, setTasks] = useState<DeveloperTask[]>([])
  const [isTracking, setIsTracking] = useState(false)

  const startTracking = useCallback((task: Omit<DeveloperTask, 'id' | 'timeSpent'>) => {
    const newTask: DeveloperTask = {
      ...task,
      id: `task-${Date.now()}`,
      timeSpent: '0 min',
      startedAt: new Date().toISOString()
    }
    
    setTasks(current => [...current, newTask])
    setIsTracking(true)
    
    // Store in localStorage for persistence
    localStorage.setItem(`tracking-${developerId}`, JSON.stringify(newTask))
    
    return newTask.id
  }, [developerId])

  const stopTracking = useCallback((taskId: string) => {
    setTasks(current => 
      current.map(task => 
        task.id === taskId 
          ? { ...task, status: 'low' as const }
          : task
      )
    )
    setIsTracking(false)
    localStorage.removeItem(`tracking-${developerId}`)
  }, [developerId])

  // Auto-update time spent
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      setTasks(current => 
        current.map(task => {
          if (!task.startedAt) return task
          
          const startTime = new Date(task.startedAt).getTime()
          const currentTime = new Date().getTime()
          const timeSpentMs = currentTime - startTime
          const timeSpentMin = Math.floor(timeSpentMs / 60000)
          
          return {
            ...task,
            timeSpent: timeSpentMin > 60 
              ? `${Math.floor(timeSpentMin / 60)} hr ${timeSpentMin % 60} min`
              : `${timeSpentMin} min`
          }
        })
      )
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [isTracking])

  return {
    tasks,
    isTracking,
    startTracking,
    stopTracking
  }
}
