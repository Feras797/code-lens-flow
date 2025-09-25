export interface Project {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived' | 'paused'
  color?: string
  teamMembers?: number
  lastActivity?: Date
  owner?: string
}

export interface ProjectStats {
  totalDevelopers: number
  activeCollisions: number
  avgResolutionTime: string
  knowledgeTransfers: number
  weeklyActivity?: {
    flowState: number
    slowProgress: number
    blockedState: number
  }
}

export interface ProjectNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  step: number
  completed?: boolean
}