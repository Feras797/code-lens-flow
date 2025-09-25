import { Search, Clock, User, CheckCircle, Code, Database, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function TeamKnowledge() {
  const [searchQuery, setSearchQuery] = useState('');

  const problemSolutions = [
    {
      id: '1',
      problem: 'PostgreSQL pooling connections timing out',
      solution: 'Implemented connection pooling with pg-pool and proper cleanup',
      solvedBy: 'Mike Thompson',
      timeSpent: '4 hours',
      peopleHelped: 3,
      tags: ['database', 'postgresql', 'performance'],
      similarity: 95,
      isRelevant: true
    },
    {
      id: '2',
      problem: 'JWT refresh token implementation',
      solution: 'Created middleware for automatic token refresh with secure httpOnly cookies',
      solvedBy: 'Sarah Chen',
      timeSpent: '2.5 hours',
      peopleHelped: 3,
      tags: ['authentication', 'jwt', 'security'],
      similarity: 87,
      isRelevant: false
    },
    {
      id: '3',
      problem: 'React component re-rendering optimization',
      solution: 'Used React.memo and useMemo for expensive calculations',
      solvedBy: 'You',
      timeSpent: '1.5 hours',
      peopleHelped: 2,
      tags: ['react', 'performance', 'optimization'],
      similarity: 78,
      isRelevant: false
    },
    {
      id: '4',
      problem: 'Stripe webhook verification failing',
      solution: 'Fixed signature validation by using raw body instead of parsed JSON',
      solvedBy: 'Emma Davis',
      timeSpent: '3 hours',
      peopleHelped: 1,
      tags: ['stripe', 'webhooks', 'payments'],
      similarity: 92,
      isRelevant: true
    }
  ];

  const teamExpertise = [
    {
      name: 'Sarah Chen',
      avatar: 'SC',
      skills: [
        { name: 'React', level: 5, examples: 12 },
        { name: 'TypeScript', level: 4, examples: 8 },
        { name: 'Authentication', level: 5, examples: 6 },
        { name: 'Testing', level: 3, examples: 4 }
      ]
    },
    {
      name: 'Mike Thompson',
      avatar: 'MT',
      skills: [
        { name: 'PostgreSQL', level: 5, examples: 15 },
        { name: 'Node.js', level: 4, examples: 10 },
        { name: 'Performance', level: 4, examples: 7 },
        { name: 'DevOps', level: 3, examples: 5 }
      ]
    },
    {
      name: 'Emma Davis',
      avatar: 'ED',
      skills: [
        { name: 'API Design', level: 5, examples: 11 },
        { name: 'Stripe', level: 4, examples: 6 },
        { name: 'Microservices', level: 4, examples: 8 },
        { name: 'Docker', level: 3, examples: 4 }
      ]
    },
    {
      name: 'You',
      avatar: 'YU',
      skills: [
        { name: 'React', level: 4, examples: 9 },
        { name: 'UI/UX', level: 5, examples: 12 },
        { name: 'Analytics', level: 4, examples: 7 },
        { name: 'Optimization', level: 4, examples: 5 }
      ]
    }
  ];

  const filteredSolutions = problemSolutions.filter(solution =>
    solution.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solution.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSkillIcon = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'react':
      case 'typescript':
      case 'ui/ux':
        return <Code className="w-4 h-4" />;
      case 'postgresql':
      case 'node.js':
      case 'api design':
        return <Database className="w-4 h-4" />;
      case 'performance':
      case 'optimization':
      case 'analytics':
        return <Zap className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSkillColor = (level: number) => {
    switch (level) {
      case 5: return 'text-status-flow';
      case 4: return 'text-primary';
      case 3: return 'text-status-slow';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Problem-Solution Directory */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Problem-Solution Directory
        </h2>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search problems, solutions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Solutions List */}
        <div className="space-y-4">
          {filteredSolutions.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-lg border p-4 ${
                item.isRelevant ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
            >
              {item.isRelevant && (
                <div className="mb-2">
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Similar to your current work
                  </span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">
                    {item.problem}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.solution}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {item.similarity && (
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium text-primary">
                      {item.similarity}% match
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Solved by {item.solvedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{item.timeSpent}</span>
                  </div>
                  <span>Helped {item.peopleHelped} teammates</span>
                </div>
                
                <Button size="sm" variant="outline" className="text-xs">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredSolutions.length === 0 && searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-2" />
            <p>No solutions found for "{searchQuery}"</p>
          </div>
        )}
      </section>

      {/* Team Expertise Matrix */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Team Expertise Matrix
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamExpertise.map((member) => (
            <div key={member.name} className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                  {member.avatar}
                </div>
                <h3 className="font-medium text-foreground">{member.name}</h3>
              </div>
              
              <div className="space-y-3">
                {member.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSkillIcon(skill.name)}
                      <span className="text-sm text-foreground">{skill.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < skill.level ? getSkillColor(skill.level) : 'text-muted'
                            } ${i < skill.level ? 'bg-current' : 'bg-current opacity-20'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">
                        {skill.examples} examples
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Knowledge Sharing Stats */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Knowledge Sharing Impact
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-status-flow mb-1">24</div>
            <div className="text-sm text-muted-foreground">Problems Solved</div>
          </div>
          
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">18h</div>
            <div className="text-sm text-muted-foreground">Time Saved Team-Wide</div>
          </div>
          
          <div className="bg-card rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-foreground mb-1">9</div>
            <div className="text-sm text-muted-foreground">Knowledge Transfers</div>
          </div>
        </div>
      </section>
    </div>
  );
}