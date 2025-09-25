import { Brain, TrendingUp, AlertCircle, CheckCircle, XCircle, Target } from 'lucide-react'

function DevelopmentCoach () {
  const antiPatterns = [
    {
      name: 'Hail Mary Pattern',
      frequency: 'Occurred 4 times this week',
      description: 'You request complete rewrites instead of debugging',
      yourPattern: '"Just rewrite the whole component"',
      betterApproach: '"What specifically causes [issue] in [component]?"',
      status: 'needs-work',
      examples: [
        { date: 'Today', context: 'UserProfile component', understood: false },
        { date: 'Yesterday', context: 'Auth middleware', understood: true }
      ]
    },
    {
      name: 'Vague Frustration Pattern',
      frequency: 'Occurred 5 times this week',
      description: 'You say "it\'s not working" requiring multiple clarifications',
      yourPattern: '"The login isn\'t working"',
      betterApproach: '"Login fails at line 23 in auth.js with \'Invalid token\' error"',
      status: 'needs-work',
      examples: [
        { date: '2 days ago', context: 'API endpoint', understood: false },
        { date: '3 days ago', context: 'Database query', understood: false }
      ]
    },
    {
      name: 'Context Amnesia Pattern',
      frequency: 'Occurred 2 times this week',
      description: 'Starting new conversations about ongoing features',
      yourPattern: '"How do I add user authentication?"',
      betterApproach: '"Continue previous auth implementation from yesterday"',
      status: 'improving',
      examples: [
        { date: 'Monday', context: 'Payment integration', understood: true },
        { date: 'Tuesday', context: 'User settings', understood: true }
      ]
    }
  ]

  const improvements = [
    {
      title: 'Include File Structure in Requests',
      status: 'improving',
      description: 'Provide context about your file organization to get better solutions',
      goodExample: 'Working on UserProfile component in src/components/user/UserProfile.tsx',
      badExample: 'How do I fix this component?'
    },
    {
      title: 'Provide Concrete Scenarios',
      status: 'needs-work',
      description: 'Describe specific use cases instead of generic requirements',
      goodExample: 'User clicks save button → validate email → show success message',
      badExample: 'I need form validation'
    },
    {
      title: 'Follow Optimal Pattern',
      status: 'mastered',
      description: 'Use your proven workflow: Describe → Implement → Test → Fix',
      goodExample: 'First, let me explain the login flow, then implement auth service...',
      badExample: 'Just build a login system'
    }
  ]

  const progress = {
    patternsImproved: 3,
    timeSaved: '2.5h',
    weeklyProgress: 85
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-foreground'>Development Coach</h1>
        <p className='text-muted-foreground mt-1'>
          Identify and fix your personal anti-patterns based on chat analysis
        </p>
      </div>


      {/* Anti-Patterns */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
          <AlertCircle className='h-5 w-5' />
          Your Anti-Patterns
        </h2>
        <div className='space-y-4'>
          {antiPatterns.map((pattern, index) => (
            <div key={index} className='bg-background/50 border border-border rounded-lg p-4'>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <h3 className='text-sm font-semibold text-foreground'>{pattern.name}</h3>
                  <p className='text-xs text-muted-foreground mt-1'>{pattern.description}</p>
                  <p className='text-xs text-red-500 mt-2'>{pattern.frequency}</p>
                </div>
                {pattern.status === 'needs-work' && (
                  <span className='px-2 py-1 bg-background text-muted-foreground text-xs rounded-lg border border-border'>
                    Needs Work
                  </span>
                )}
                {pattern.status === 'improving' && (
                  <span className='px-2 py-1 bg-background text-muted-foreground text-xs rounded-lg border border-border'>
                    Improving
                  </span>
                )}
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                <div className='bg-background border border-border rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <XCircle className='h-4 w-4 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>Your Pattern</span>
                  </div>
                  <p className='text-xs text-foreground/70 font-mono'>
                    {pattern.yourPattern}
                  </p>
                </div>
                <div className='bg-background border border-primary/30 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <CheckCircle className='h-4 w-4 text-primary' />
                    <span className='text-xs font-medium text-primary'>Better Approach</span>
                  </div>
                  <p className='text-xs text-foreground font-mono'>
                    {pattern.betterApproach}
                  </p>
                </div>
              </div>

              <div className='flex gap-2'>
                <button className='text-xs text-primary hover:text-primary/80'>
                  Show More Examples
                </button>
                <button className='text-xs text-primary hover:text-primary/80'>
                  Mark as Understood
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Improvements */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
          <Target className='h-5 w-5' />
          Personalized Improvements
        </h2>
        <div className='space-y-4'>
          {improvements.map((improvement, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 bg-background ${
                improvement.status === 'mastered' 
                  ? 'border-primary/30' 
                  : improvement.status === 'improving'
                  ? 'border-border'
                  : 'border-border'
              }`}
            >
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <h3 className='text-sm font-semibold text-foreground flex items-center gap-2'>
                    {improvement.status === 'mastered' && <CheckCircle className='h-4 w-4 text-primary' />}
                    {improvement.status === 'improving' && <TrendingUp className='h-4 w-4 text-muted-foreground' />}
                    {improvement.status === 'needs-work' && <AlertCircle className='h-4 w-4 text-muted-foreground' />}
                    {improvement.title}
                  </h3>
                  <p className='text-xs text-muted-foreground mt-1'>{improvement.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-lg border ${
                  improvement.status === 'mastered' 
                    ? 'bg-primary/10 text-primary border-primary/20' 
                    : improvement.status === 'improving'
                    ? 'bg-background text-muted-foreground border-border'
                    : 'bg-background text-muted-foreground border-border'
                }`}>
                  {improvement.status === 'mastered' && 'Mastered'}
                  {improvement.status === 'improving' && 'Improving'}
                  {improvement.status === 'needs-work' && 'Needs Work'}
                </span>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='bg-background border border-primary/30 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <CheckCircle className='h-3 w-3 text-primary' />
                    <span className='text-xs font-medium text-primary'>Good Example</span>
                  </div>
                  <p className='text-xs text-foreground font-mono'>
                    {improvement.goodExample}
                  </p>
                </div>
                <div className='bg-background border border-border rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <XCircle className='h-3 w-3 text-muted-foreground' />
                    <span className='text-xs font-medium text-muted-foreground'>Avoid</span>
                  </div>
                  <p className='text-xs text-foreground/70 font-mono'>
                    {improvement.badExample}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DevelopmentCoach
