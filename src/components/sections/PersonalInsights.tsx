import { useState } from 'react';
import { Clock, GitCommit, Code, Bug, Settings, Database, ChevronRight, Calendar, Zap, Target, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { StealthCard } from '@/components/ui/stealth-card';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function PersonalInsights() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const todaysSummary = {
    morning: 'Completed user profile component with React.memo optimization',
    afternoon: 'Building admin dashboard, switched Chart.js → Recharts',
    keyDecisions: [
      'Chose Context over prop drilling for state management',
      'Deferred complex filtering to backend'
    ],
    abandoned: 'Custom chart solution (too time-consuming)'
  };

  const getImpactValue = (impact: string) => {
    switch (impact) {
      case 'high': return 100;
      case 'medium': return 66;
      case 'low': return 33;
      default: return 0;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-status-flow';
      case 'medium': return 'text-status-slow';
      case 'low': return 'text-status-blocked';
      default: return 'text-foreground-muted';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'text-status-flow border-status-flow/20 bg-status-flow-bg/30';
      case 'code': return 'text-status-flow border-status-flow/20 bg-status-flow-bg/30';
      case 'decision': return 'text-status-slow border-status-slow/20 bg-status-slow-bg/30';
      case 'bug': return 'text-status-blocked border-status-blocked/20 bg-status-blocked-bg/30';
      case 'database': return 'text-status-slow border-status-slow/20 bg-status-slow-bg/30';
      case 'abandoned': return 'text-foreground-subtle border-border/30 bg-background-subtle/50';
      default: return 'text-foreground-muted border-border/30 bg-background-subtle/50';
    }
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
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Refined Header */}
        <StealthCard className="p-6 relative overflow-hidden border border-card-border/50" variant="glass">
          <div className="absolute inset-0 bg-gradient-to-br from-status-flow/5 to-transparent" />
          
          <div className="relative flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-background-card border border-status-flow/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-status-flow" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Personal Development Insights
              </h2>
              <p className="text-sm text-foreground-muted mt-0.5">
                Transform chat history into actionable understanding of your coding journey
              </p>
            </div>
          </div>
        </StealthCard>

        {/* Refined Today's Development Recap */}
        <StealthCard className="p-5 border border-border/50" variant="default">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-foreground-muted" />
            <h3 className="text-lg font-semibold text-foreground">Today's Development Recap</h3>
            <Badge variant="outline" className="ml-auto text-xs bg-status-flow-bg/30 text-status-flow border-status-flow/20">
              Active
            </Badge>
          </div>
          
          <Accordion type="multiple" defaultValue={["morning", "afternoon"]} className="w-full">
            <AccordionItem value="morning" className="border-b border-border/30">
              <AccordionTrigger className="hover:text-foreground transition-colors py-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs bg-status-flow-bg/30 text-status-flow border-status-flow/20">
                    Morning
                  </Badge>
                  <span className="text-xs text-foreground-subtle">09:30 - 12:00</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 pb-4">
                <div className="space-y-2">
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {todaysSummary.morning}
                  </p>
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-status-flow" />
                    <span className="text-xs text-status-flow">Performance optimization focus</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="afternoon" className="border-b border-border/30">
              <AccordionTrigger className="hover:text-foreground transition-colors py-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs bg-status-slow-bg/30 text-status-slow border-status-slow/20">
                    Afternoon
                  </Badge>
                  <span className="text-xs text-foreground-subtle">13:00 - 17:30</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 pb-4">
                <div className="space-y-2">
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {todaysSummary.afternoon}
                  </p>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-status-slow" />
                    <span className="text-xs text-status-slow">Architecture improvements</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="decisions" className="border-b border-border/30">
              <AccordionTrigger className="hover:text-foreground transition-colors py-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs bg-status-flow-bg/30 text-status-flow border-status-flow/20">
                    Key Decisions
                  </Badge>
                  <span className="text-xs text-foreground-subtle">{todaysSummary.keyDecisions.length} decisions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 pb-4">
                <div className="space-y-2">
                  {todaysSummary.keyDecisions.map((decision, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-background-subtle/50 border border-border/30">
                      <ChevronRight className="w-3 h-3 text-status-flow mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground-muted">{decision}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="abandoned" className="border-0">
              <AccordionTrigger className="hover:text-foreground transition-colors py-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs bg-status-blocked-bg/30 text-status-blocked border-status-blocked/20">
                    Abandoned
                  </Badge>
                  <span className="text-xs text-foreground-subtle">Learning opportunity</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-3 pb-4">
                <div className="p-3 rounded-lg bg-status-blocked-bg/20 border border-status-blocked/20">
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {todaysSummary.abandoned}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </StealthCard>

        {/* Refined Development Timeline */}
        <StealthCard className="p-5 border border-border/50" variant="default">
          <div className="flex items-center gap-2 mb-5">
            <GitCommit className="w-5 h-5 text-foreground-muted" />
            <h3 className="text-lg font-semibold text-foreground">Development Timeline</h3>
            <Badge variant="outline" className="ml-auto text-xs bg-background-subtle/50 text-foreground-subtle border-border/30">
              {developmentTimeline.length} events
            </Badge>
          </div>
          
          <div className="relative">
            {/* Subtle timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50" />

            <div className="space-y-4">
              {developmentTimeline.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <div key={index} className={cn(
                    "relative flex items-start gap-4 group animate-fade-in",
                  )} style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                    {/* Timeline dot */}
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-10 h-10 rounded-lg border transition-all",
                      event.impact === 'high'
                        ? 'bg-status-flow-bg/50 border-status-flow/25 text-status-flow' :
                      event.impact === 'medium'
                        ? 'bg-status-slow-bg/50 border-status-slow/25 text-status-slow' :
                        'bg-status-blocked-bg/50 border-status-blocked/25 text-status-blocked'
                    )}>
                      <IconComponent className="w-4 h-4" />
                      {event.impact === 'high' && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-status-flow/60 rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <StealthCard 
                        className="p-4 border-l-3 hover:shadow-md transition-all cursor-pointer" 
                        style={{
                          borderLeftColor: event.impact === 'high' 
                            ? 'hsl(var(--status-flow) / 0.8)'
                            : event.impact === 'medium'
                            ? 'hsl(var(--status-slow) / 0.8)'
                            : 'hsl(var(--status-blocked) / 0.8)',
                          borderLeftWidth: '3px'
                        }}
                        variant="default"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-foreground text-sm">
                              {event.title}
                            </h4>
                            <p className="text-xs text-foreground-muted">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-foreground-subtle font-mono">
                              {event.time}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                getEventTypeColor(event.type)
                              )}
                            >
                              {event.type}
                            </Badge>
                          </div>
                        </div>

                        {/* Impact indicator */}
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs text-foreground-subtle">Impact:</span>
                          <div className="flex-1 max-w-[60px]">
                            <Progress
                              value={getImpactValue(event.impact)}
                              className="h-1.5"
                            />
                          </div>
                          <span className={cn("text-xs font-medium", getImpactColor(event.impact))}>
                            {event.impact}
                          </span>
                        </div>
                      </StealthCard>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </StealthCard>
      </div>
    </TooltipProvider>
  );
}