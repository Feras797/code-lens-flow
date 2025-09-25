import { Search, Users, Clock, CheckCircle, GitBranch, BookOpen, Zap } from 'lucide-react'
import { useState } from 'react'

function KnowledgeBase () {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const problems = [
    {
      id: 1,
      title: 'PostgreSQL pooling connections timing out',
      description: 'Implemented connection pooling with pg-pool and proper cleanup',
      tags: ['database', 'postgresql', 'performance'],
      solvedBy: 'Mike Thompson',
      timeSaved: '4 hours',
      helpedCount: 3,
      match: '95%'
    },
    {
      id: 2,
      title: 'JWT refresh token implementation',
      description: 'Created middleware for automatic token refresh with secure httpOnly cookies',
      tags: ['authentication', 'jwt', 'security'],
      solvedBy: 'Sarah Chen',
      timeSaved: '2.5 hours',
      helpedCount: 3,
      match: '87%'
    },
    {
      id: 3,
      title: 'React component re-rendering optimization',
      description: 'Used React.memo and useMemo for expensive calculations',
      tags: ['react', 'performance', 'optimization'],
      solvedBy: 'You',
      timeSaved: '1.5 hours',
      helpedCount: 2,
      match: '78%'
    },
    {
      id: 4,
      title: 'Stripe webhook verification failing',
      description: 'Fixed signature validation by using raw body instead of parsed JSON',
      tags: ['stripe', 'webhooks', 'payments'],
      solvedBy: 'Emma Davis',
      timeSaved: '3 hours',
      helpedCount: 1,
      match: '92%'
    }
  ]

  const teamExperts = [
    {
      name: 'Sarah Chen',
      avatar: 'SC',
      skills: [
        { name: 'React', level: 12 },
        { name: 'TypeScript', level: 8 },
        { name: 'Authentication', level: 6 },
        { name: 'Testing', level: 4 }
      ]
    },
    {
      name: 'Mike Thompson',
      avatar: 'MT',
      skills: [
        { name: 'PostgreSQL', level: 15 },
        { name: 'Node.js', level: 10 },
        { name: 'Performance', level: 7 },
        { name: 'DevOps', level: 5 }
      ]
    },
    {
      name: 'Emma Davis',
      avatar: 'ED',
      skills: [
        { name: 'API Design', level: 11 },
        { name: 'Stripe', level: 6 },
        { name: 'Microservices', level: 8 },
        { name: 'Docker', level: 4 }
      ]
    },
    {
      name: 'You',
      avatar: 'YU',
      skills: [
        { name: 'React', level: 9 },
        { name: 'UI/UX', level: 12 },
        { name: 'Analytics', level: 7 },
        { name: 'Optimization', level: 5 }
      ]
    }
  ]

  const knowledgeImpact = {
    problemsSolved: 24,
    timeSavedTeamWide: '18h',
    knowledgeTransfers: 9
  }

  const getSkillColor = (level: number) => {
    if (level >= 10) return 'bg-status-flow'
    if (level >= 6) return 'bg-primary'
    if (level >= 3) return 'bg-status-slow'
    return 'bg-muted'
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-foreground'>Team Knowledge Base</h1>
        <p className='text-muted-foreground mt-1'>
          Automatically build collective intelligence from individual conversations
        </p>
      </div>


      {/* Problem-Solution Mapping */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-foreground'>Problem-Solution Mapping</h2>
          <button className='text-sm text-primary hover:text-primary/80'>
            Common Struggles Identified
          </button>
        </div>
        
        {/* Search Bar */}
        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search problems, solutions, or tags...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
          />
        </div>

        {/* Filter Tags */}
        <div className='flex gap-2 mb-6 flex-wrap'>
          {['all', 'database', 'react', 'authentication', 'performance'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                selectedFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'all' ? 'All' : filter}
            </button>
          ))}
        </div>

        {/* Problems List */}
        <div className='space-y-3'>
          {problems.map(problem => (
            <div key={problem.id} className='bg-background/50 border border-border rounded-lg p-4 hover:border-primary/30 transition-colors'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='text-sm font-medium text-foreground'>{problem.title}</h3>
                    <span className='px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full'>
                      {problem.match} match
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground mb-2'>{problem.description}</p>
                  <div className='flex items-center gap-4 text-xs'>
                    <div className='flex items-center gap-1'>
                      <Users className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground'>Solved by {problem.solvedBy}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground'>{problem.timeSaved} saved</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Zap className='h-3 w-3 text-muted-foreground' />
                      <span className='text-muted-foreground'>Helped {problem.helpedCount} teammates</span>
                    </div>
                  </div>
                  <div className='flex gap-2 mt-2'>
                    {problem.tags.map(tag => (
                      <span key={tag} className='px-2 py-0.5 bg-background border border-border text-xs rounded'>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button className='text-xs text-primary hover:text-primary/80'>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Expertise Matrix */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-foreground'>Team Expertise Matrix & Smart Pairing</h2>
          <button className='text-xs text-primary hover:text-primary/80'>
            Optimal pair programming suggestions
          </button>
        </div>
        
        {/* Smart Pairing Suggestions */}
        <div className='bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6'>
          <h3 className='text-sm font-medium text-primary mb-2'>Smart Pairing Suggestions</h3>
          <p className='text-xs text-muted-foreground mb-2'>
            Current Blockers: John (Stripe) + Mike (Database expertise)
          </p>
          <p className='text-xs text-muted-foreground'>
            Knowledge Transfer: Sarah (Auth) + You (Analytics integration)
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {teamExperts.map((expert, index) => (
            <div key={index} className='bg-background/50 border border-border rounded-lg p-4'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium'>
                  {expert.avatar}
                </div>
                <h3 className='text-sm font-medium text-foreground'>{expert.name}</h3>
              </div>
              <div className='space-y-2'>
                {expert.skills.map((skill, i) => (
                  <div key={i} className='flex items-center gap-2'>
                    <BookOpen className='h-3 w-3 text-muted-foreground' />
                    <span className='text-xs text-muted-foreground flex-1'>{skill.name}</span>
                    <div className='flex gap-1'>
                      {[...Array(5)].map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 w-6 rounded-full ${
                            idx < Math.ceil(skill.level / 3)
                              ? getSkillColor(skill.level)
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <span className='text-xs text-muted-foreground ml-1'>
                      {skill.level} examples
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBase
