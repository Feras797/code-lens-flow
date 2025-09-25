import { Clock, GitCommit, Code, Bug, Settings, Database } from 'lucide-react';

export function PersonalInsights() {
  const todaysSummary = {
    morning: 'Completed user profile component with React.memo optimization',
    afternoon: 'Building admin dashboard, switched Chart.js → Recharts',
    keyDecisions: [
      'Chose Context over prop drilling for state management',
      'Deferred complex filtering to backend'
    ],
    abandoned: 'Custom chart solution (too time-consuming)'
  };

  const developmentTimeline = [
    {
      date: '2025-01-15',
      time: '09:30',
      type: 'feature',
      title: 'Started user authentication system',
      description: 'Initial setup with Supabase integration for auth flows',
      icon: Settings,
      impact: 'high'
    },
    {
      date: '2025-01-15',
      time: '11:15',
      type: 'code',
      title: 'Implemented React.memo optimization',
      description: 'Optimized user profile component rendering performance',
      icon: Code,
      impact: 'medium'
    },
    {
      date: '2025-01-15',
      time: '14:20',
      type: 'decision',
      title: 'Switched from Chart.js to Recharts',
      description: 'Better TypeScript support and React integration for dashboard charts',
      icon: GitCommit,
      impact: 'high'
    },
    {
      date: '2025-01-15',
      time: '15:45',
      type: 'bug',
      title: 'Fixed state management issue',
      description: 'Resolved prop drilling problems by implementing Context API',
      icon: Bug,
      impact: 'high'
    },
    {
      date: '2025-01-15',
      time: '16:30',
      type: 'database',
      title: 'Deferred complex filtering to backend',
      description: 'Performance optimization by moving heavy operations server-side',
      icon: Database,
      impact: 'medium'
    },
    {
      date: '2025-01-15',
      time: '17:15',
      type: 'abandoned',
      title: 'Abandoned custom chart solution',
      description: 'Too time-consuming, decided to use existing library instead',
      icon: Code,
      impact: 'low'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Feature Header */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Personal Development Insights
        </h2>
        <p className="text-sm text-muted-foreground">
          Transform chat history into actionable understanding of your coding journey
        </p>
      </div>
      {/* Today's Development Recap */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Development Recap
        </h2>
        
        <div className="bg-card rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Morning</h4>
              <p className="text-sm text-muted-foreground">{todaysSummary.morning}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Afternoon</h4>
              <p className="text-sm text-muted-foreground">{todaysSummary.afternoon}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Key Decisions</h4>
              <ul className="space-y-1">
                {todaysSummary.keyDecisions.map((decision, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {decision}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-2">Abandoned</h4>
              <p className="text-sm text-muted-foreground">{todaysSummary.abandoned}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Development Timeline */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <GitCommit className="w-5 h-5" />
          Development Timeline
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border"></div>

          <div className="space-y-6">
            {developmentTimeline.map((event, index) => {
              const IconComponent = event.icon;
              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    event.impact === 'high' ? 'bg-green-500/10 border-green-500 text-green-500' :
                    event.impact === 'medium' ? 'bg-blue-500/10 border-blue-500 text-blue-500' :
                    'bg-gray-500/10 border-gray-500 text-gray-500'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground text-sm mb-1">
                            {event.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end text-xs text-muted-foreground">
                          <span>{event.time}</span>
                          <span className={`mt-1 px-2 py-1 rounded text-xs ${
                            event.type === 'feature' ? 'bg-blue-500/10 text-blue-500' :
                            event.type === 'code' ? 'bg-green-500/10 text-green-500' :
                            event.type === 'decision' ? 'bg-purple-500/10 text-purple-500' :
                            event.type === 'bug' ? 'bg-red-500/10 text-red-500' :
                            event.type === 'database' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-gray-500/10 text-gray-500'
                          }`}>
                            {event.type}
                          </span>
                        </div>
                      </div>

                      {/* Impact indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Impact:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((level) => (
                            <div
                              key={level}
                              className={`w-2 h-2 rounded-full ${
                                (event.impact === 'high' && level <= 3) ||
                                (event.impact === 'medium' && level <= 2) ||
                                (event.impact === 'low' && level <= 1)
                                  ? 'bg-primary'
                                  : 'bg-muted'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}