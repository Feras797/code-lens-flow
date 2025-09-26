import { Project, Developer, Collision, AntiPattern, Insight } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    activeDevelopers: 5,
    statusDistribution: { active: 3, slow: 1, blocked: 1 },
    lastRefresh: '2 min ago',
    hasCollisions: true,
    developers: [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'SC',
        currentTask: 'JWT token implementation',
        status: 'flow',
        duration: '45 min',
        fileName: 'auth.js'
      },
      {
        id: '2',
        name: 'John Martinez',
        avatar: 'JM',
        currentTask: 'Stripe webhook failing',
        status: 'blocked',
        duration: '2.5 hrs',
        fileName: 'payment.js'
      },
      {
        id: '3',
        name: 'Mike Thompson',
        avatar: 'MT',
        currentTask: 'Refactoring user table',
        status: 'slow',
        duration: '1.2 hrs',
        fileName: 'schema.sql'
      },
      {
        id: '4',
        name: 'Emma Davis',
        avatar: 'ED',
        currentTask: 'Product CRUD endpoints',
        status: 'flow',
        duration: '30 min',
        fileName: 'products.js'
      },
      {
        id: '5',
        name: 'You',
        avatar: 'YU',
        currentTask: 'Analytics dashboard',
        status: 'flow',
        duration: '1 hr',
        fileName: 'auth.js'
      }
    ]
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    activeDevelopers: 3,
    statusDistribution: { active: 2, slow: 1, blocked: 0 },
    lastRefresh: '5 min ago',
    hasCollisions: false,
    developers: [
      {
        id: '6',
        name: 'Alex Kim',
        avatar: 'AK',
        currentTask: 'Transaction history UI',
        status: 'flow',
        duration: '1.5 hrs'
      },
      {
        id: '7',
        name: 'Lisa Wang',
        avatar: 'LW',
        currentTask: 'Security audit fixes',
        status: 'slow',
        duration: '3 hrs'
      },
      {
        id: '8',
        name: 'David Park',
        avatar: 'DP',
        currentTask: 'Push notification service',
        status: 'flow',
        duration: '45 min'
      }
    ]
  },
  {
    id: '3',
    name: 'CRM Home',
    activeDevelopers: 4,
    statusDistribution: { active: 4, slow: 0, blocked: 0 },
    lastRefresh: '1 min ago',
    hasCollisions: false,
    developers: [
      {
        id: '9',
        name: 'Sophie Miller',
        avatar: 'SM',
        currentTask: 'Contact management',
        status: 'flow',
        duration: '2 hrs'
      },
      {
        id: '10',
        name: 'Ryan Foster',
        avatar: 'RF',
        currentTask: 'Email integration',
        status: 'flow',
        duration: '1 hr'
      },
      {
        id: '11',
        name: 'Nina Patel',
        avatar: 'NP',
        currentTask: 'Report generation',
        status: 'flow',
        duration: '30 min'
      },
      {
        id: '12',
        name: 'Carlos Silva',
        avatar: 'CS',
        currentTask: 'Data export features',
        status: 'flow',
        duration: '1.5 hrs'
      }
    ]
  }
];

export const mockCollisions: Collision[] = [
  {
    id: '1',
    developers: ['Sarah Chen', 'You'],
    file: 'auth.js',
    type: 'file'
  }
];

export const mockAntiPatterns: AntiPattern[] = [
  {
    id: '1',
    title: 'Hail Mary Pattern',
    description: 'You request complete rewrites instead of debugging',
    example: 'Just rewrite the whole component',
    improvement: 'What specifically causes [issue] in [component]?',
    frequency: 3
  },
  {
    id: '2',
    title: 'Vague Frustration Pattern',
    description: 'You say "it\'s not working" requiring multiple clarifications',
    example: 'The login isn\'t working',
    improvement: 'Login fails at line 23 in auth.js with "Invalid token" error',
    frequency: 5
  },
  {
    id: '3',
    title: 'Context Amnesia Pattern',
    description: 'Starting new conversations about ongoing features',
    example: 'How do I add user authentication?',
    improvement: 'Continue previous auth implementation from yesterday',
    frequency: 2
  }
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    title: 'Morning Frontend Focus',
    description: 'You typically spend mornings on frontend tasks with 40% higher productivity',
    type: 'pattern'
  },
  {
    id: '2',
    title: 'Productivity Peak',
    description: 'Your productivity peaks between 2-4 PM with fastest problem resolution',
    type: 'productivity'
  },
  {
    id: '3',
    title: 'Context Switching Cost',
    description: 'You lose 25 minutes of productivity when switching between frontend and backend tasks',
    type: 'focus'
  }
];