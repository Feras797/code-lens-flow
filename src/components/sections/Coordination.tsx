import { ArrowRight, CheckCircle, AlertTriangle, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';

interface CoordinationProps {
  project: Project;
}

export function Coordination({ project }: CoordinationProps) {
  const suggestions = [
    {
      id: '1',
      title: 'Resolve File Collision',
      description: 'Sarah and You are both editing auth.js',
      action: 'Move Sarah to testing while You finish auth implementation',
      priority: 'high',
      type: 'collision'
    },
    {
      id: '2',
      title: 'Unblock John',
      description: 'John has been stuck on Stripe webhook for 2.5 hours',
      action: 'Mike solved similar issue last week - suggest consultation',
      priority: 'high',
      type: 'support'
    },
    {
      id: '3',
      title: 'Optimize Work Distribution',
      description: 'Emma finished CRUD endpoints ahead of schedule',
      action: 'Assign Emma to help Mike with database refactoring',
      priority: 'medium',
      type: 'optimization'
    }
  ];

  const dependencies = [
    {
      id: '1',
      blocker: 'Emma Davis',
      blocked: 'Mike Thompson',
      task: 'Database schema completion',
      impact: 'Product endpoints depend on updated user table'
    },
    {
      id: '2',
      blocker: 'You',
      blocked: 'Sarah Chen',
      task: 'Auth service completion',
      impact: 'JWT implementation requires base auth structure'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-status-blocked bg-status-blocked-bg';
      case 'medium': return 'border-status-slow bg-status-slow-bg';
      case 'low': return 'border-status-flow bg-status-flow-bg';
      default: return 'border-border bg-card';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'collision': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'support': return <Users className="w-5 h-5 text-primary" />;
      case 'optimization': return <CheckCircle className="w-5 h-5 text-status-flow" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Suggestions */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Coordination Suggestions
        </h2>
        
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`rounded-lg border-l-4 p-4 ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getTypeIcon(suggestion.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-foreground">{suggestion.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      suggestion.priority === 'high' ? 'bg-status-blocked text-white' :
                      suggestion.priority === 'medium' ? 'bg-status-slow text-white' :
                      'bg-status-flow text-white'
                    }`}>
                      {suggestion.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  
                  <p className="text-sm text-foreground mb-3">
                    <strong>Suggested action:</strong> {suggestion.action}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dependency Tracking */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Current Dependencies
        </h2>
        
        <div className="space-y-4">
          {dependencies.map((dep) => (
            <div key={dep.id} className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm mb-1">
                    {dep.blocker.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-xs text-muted-foreground">Blocker</div>
                </div>
                
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-medium text-sm mb-1">
                    {dep.blocked.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-xs text-muted-foreground">Waiting</div>
                </div>
                
                <div className="flex-1 ml-4">
                  <h4 className="font-medium text-foreground">{dep.task}</h4>
                  <p className="text-sm text-muted-foreground">{dep.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {dependencies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-status-flow" />
            <p>No blocking dependencies detected</p>
          </div>
        )}
      </section>

      {/* Work Distribution Optimization */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Optimal Work Distribution
        </h2>
        
        <div className="bg-card rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-status-flow mb-2">Continue Current Work</h4>
              <ul className="space-y-1 text-sm">
                <li className="text-muted-foreground">• Emma (Product CRUD) - in flow</li>
                <li className="text-muted-foreground">• You (Analytics) - in flow</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-status-slow mb-2">Consider Task Switch</h4>
              <ul className="space-y-1 text-sm">
                <li className="text-muted-foreground">• John (move to testing)</li>
                <li className="text-muted-foreground">• Mike (pair with Emma)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}