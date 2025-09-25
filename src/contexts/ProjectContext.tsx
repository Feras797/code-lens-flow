import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Project, ProjectStats } from '@/types/project'

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  projectStats: ProjectStats | null
  loading: boolean
  error: string | null
  selectProject: (projectId: string) => void
  refreshProjects: () => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// Mock data for development
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Code Lens Flow',
    description: 'Real-time development team coordination platform',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    status: 'active',
    color: '#3b82f6',
    teamMembers: 12,
    lastActivity: new Date(),
    owner: 'john@example.com'
  },
  {
    id: '2',
    name: 'Analytics Dashboard',
    description: 'Business intelligence and reporting system',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-20'),
    status: 'active',
    color: '#10b981',
    teamMembers: 8,
    lastActivity: new Date('2024-02-20'),
    owner: 'sarah@example.com'
  },
  {
    id: '3',
    name: 'Mobile App Refactor',
    description: 'Legacy mobile application modernization',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2024-01-05'),
    status: 'paused',
    color: '#f59e0b',
    teamMembers: 5,
    lastActivity: new Date('2024-01-05'),
    owner: 'mike@example.com'
  }
]

const mockStats: ProjectStats = {
  totalDevelopers: 12,
  activeCollisions: 3,
  avgResolutionTime: '1.8h',
  knowledgeTransfers: 47,
  weeklyActivity: {
    flowState: 9,
    slowProgress: 2,
    blockedState: 1
  }
}

interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      setProjectStats(mockStats) // In real app, fetch project-specific stats
      localStorage.setItem('selectedProjectId', projectId)
    }
  }

  const refreshProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProjects(mockProjects)
    } catch (err) {
      setError('Failed to refresh projects')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    setLoading(true)
    setError(null)
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setProjects(prev => [...prev, newProject])
      return newProject
    } catch (err) {
      setError('Failed to create project')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Load selected project from localStorage on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem('selectedProjectId')
    if (savedProjectId) {
      selectProject(savedProjectId)
    }
  }, [selectProject])

  const value: ProjectContextType = {
    projects,
    currentProject,
    projectStats,
    loading,
    error,
    selectProject,
    refreshProjects,
    createProject
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}