import { Clock, TrendingUp, Focus, BarChart3 } from 'lucide-react';
import { mockInsights } from '@/data/mockData';

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

  const focusShifts = [
    { period: 'Week 1', focus: 'Basic setup and components', progress: 100 },
    { period: 'Week 2', focus: 'Feature implementation', progress: 100 },
    { period: 'Week 3', focus: 'State management and optimization', progress: 85 },
    { period: 'Current', focus: 'Polish and scale', progress: 45 }
  ];

  const timeDistribution = [
    { area: 'Frontend Components', hours: 12, percentage: 40 },
    { area: 'State Management', hours: 8, percentage: 27 },
    { area: 'API Integration', hours: 6, percentage: 20 },
    { area: 'Testing & Debug', hours: 4, percentage: 13 }
  ];

  return (
    <div className="space-y-8">
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

      {/* Project Focus Shifts */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Project Focus Evolution
        </h2>
        
        <div className="space-y-3">
          {focusShifts.map((shift, index) => (
            <div key={index} className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-foreground">{shift.period}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {shift.focus}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {shift.progress}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${shift.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Time Distribution */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Time Distribution This Week
        </h2>
        
        <div className="bg-card rounded-lg border p-6">
          <div className="space-y-4">
            {timeDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {item.area}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.hours}h ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-64 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Insights */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Focus className="w-5 h-5" />
          Pattern Recognition
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockInsights.map((insight) => (
            <div key={insight.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  insight.type === 'pattern' ? 'bg-status-flow-bg' :
                  insight.type === 'productivity' ? 'bg-primary/10' :
                  'bg-status-slow-bg'
                }`}>
                  {insight.type === 'pattern' ? '🔄' : 
                   insight.type === 'productivity' ? '⚡' : '🎯'}
                </div>
                <h4 className="font-medium text-foreground text-sm">
                  {insight.title}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}