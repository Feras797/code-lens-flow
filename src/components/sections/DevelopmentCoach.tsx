import { AlertCircle, CheckCircle, TrendingUp, Target, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockAntiPatterns } from '@/data/mockData';

export function DevelopmentCoach() {
  const progressMetrics = {
    patternsImproved: 3,
    timeSaved: 2.5,
    weeklyProgress: 85
  };

  const improvements = [
    {
      id: '1',
      title: 'Include File Structure in Requests',
      description: 'Provide context about your file organization to get better solutions',
      goodExample: 'Working on UserProfile component in src/components/user/UserProfile.tsx',
      badExample: 'How do I fix this component?',
      status: 'improving'
    },
    {
      id: '2',
      title: 'Provide Concrete Scenarios',
      description: 'Describe specific use cases instead of generic requirements',
      goodExample: 'User clicks save button → validate email → show success message',
      badExample: 'I need form validation',
      status: 'needs_work'
    },
    {
      id: '3',
      title: 'Follow Optimal Pattern',
      description: 'Use your proven workflow: Describe → Implement → Test → Fix',
      goodExample: 'First, let me explain the login flow, then implement auth service...',
      badExample: 'Just build a login system',
      status: 'mastered'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-status-flow-bg border-status-flow';
      case 'improving': return 'bg-status-slow-bg border-status-slow';
      case 'needs_work': return 'bg-status-blocked-bg border-status-blocked';
      default: return 'bg-muted border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle className="w-4 h-4 text-status-flow" />;
      case 'improving': return <TrendingUp className="w-4 h-4 text-status-slow" />;
      case 'needs_work': return <AlertCircle className="w-4 h-4 text-status-blocked" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Feature Header */}
      <div className="bg-card rounded-lg border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Development Coach
        </h2>
        <p className="text-sm text-muted-foreground">
          Identify and fix your personal anti-patterns based on chat analysis
        </p>
      </div>
      {/* Progress Overview */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Development Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-status-flow mb-1">
              {progressMetrics.patternsImproved}
            </div>
            <div className="text-sm text-muted-foreground">
              Patterns Improved This Week
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {progressMetrics.timeSaved}h
            </div>
            <div className="text-sm text-muted-foreground">
              Time Saved
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-foreground mb-1">
              {progressMetrics.weeklyProgress}%
            </div>
            <div className="text-sm text-muted-foreground">
              Weekly Progress
            </div>
          </div>
        </div>
      </section>

      {/* Anti-Pattern Detection */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Your Anti-Patterns
        </h2>
        
        <div className="space-y-4">
          {mockAntiPatterns.map((pattern) => (
            <div key={pattern.id} className="bg-card rounded-lg border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {pattern.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {pattern.description}
                  </p>
                  <span className="text-xs bg-status-blocked-bg text-status-blocked px-2 py-1 rounded-full">
                    Occurred {pattern.frequency} times this week
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-status-blocked-bg border border-status-blocked/20 rounded-lg p-4">
                  <h4 className="font-medium text-status-blocked mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Your Pattern
                  </h4>
                  <p className="text-sm text-foreground font-mono bg-background/50 p-2 rounded">
                    "{pattern.example}"
                  </p>
                </div>
                
                <div className="bg-status-flow-bg border border-status-flow/20 rounded-lg p-4">
                  <h4 className="font-medium text-status-flow mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Better Approach
                  </h4>
                  <p className="text-sm text-foreground font-mono bg-background/50 p-2 rounded">
                    "{pattern.improvement}"
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Show More Examples
                </Button>
                <Button size="sm" className="text-xs">
                  Mark as Understood
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personalized Improvements */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Personalized Improvements
        </h2>
        
        <div className="space-y-4">
          {improvements.map((improvement) => (
            <div
              key={improvement.id}
              className={`rounded-lg border-l-4 p-4 ${getStatusColor(improvement.status)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(improvement.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-foreground">{improvement.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-background/50">
                      {improvement.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {improvement.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-xs font-medium text-status-flow mb-1">✓ Good Example</h4>
                      <p className="text-xs text-foreground bg-background/50 p-2 rounded font-mono">
                        {improvement.goodExample}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-status-blocked mb-1">✗ Avoid</h4>
                      <p className="text-xs text-foreground bg-background/50 p-2 rounded font-mono">
                        {improvement.badExample}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}