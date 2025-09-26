import { useState } from 'react';
import { Clock, GitCommit, Code, Bug, Settings, Database, ChevronRight, Calendar, Zap, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-blue-600 dark:text-blue-400';
      case 'low': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 hover:bg-blue-500/20';
      case 'code': return 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20 hover:bg-green-500/20';
      case 'decision': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 hover:bg-purple-500/20';
      case 'bug': return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20 hover:bg-red-500/20';
      case 'database': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20 hover:bg-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20 hover:bg-gray-500/20';
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
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Enhanced Feature Header */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 transition-all duration-500 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 animate-pulse" />
          <CardHeader className="relative">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Personal Development Insights
            </CardTitle>
            <CardDescription className="text-sm">
              Transform chat history into actionable understanding of your coding journey
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Enhanced Today's Development Recap with Accordion */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Today's Development Recap
              <Badge variant="outline" className="ml-auto animate-pulse">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["morning", "afternoon"]} className="w-full">
              <AccordionItem value="morning" className="border-b border-border/50">
                <AccordionTrigger className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300">
                      Morning
                    </Badge>
                    <span className="text-sm text-muted-foreground">09:30 - 12:00</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="animate-in slide-in-from-left-1 duration-300">
                  <div className="pt-4 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {todaysSummary.morning}
                    </p>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">Performance optimization focus</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="afternoon" className="border-b border-border/50">
                <AccordionTrigger className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300">
                      Afternoon
                    </Badge>
                    <span className="text-sm text-muted-foreground">13:00 - 17:30</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="animate-in slide-in-from-left-1 duration-300">
                  <div className="pt-4 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {todaysSummary.afternoon}
                    </p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-600 dark:text-purple-400">Architecture improvements</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="decisions" className="border-b border-border/50">
                <AccordionTrigger className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300">
                      Key Decisions
                    </Badge>
                    <span className="text-sm text-muted-foreground">{todaysSummary.keyDecisions.length} decisions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="animate-in slide-in-from-left-1 duration-300">
                  <div className="pt-4 space-y-3">
                    {todaysSummary.keyDecisions.map((decision, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{decision}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="abandoned">
                <AccordionTrigger className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                      Abandoned
                    </Badge>
                    <span className="text-sm text-muted-foreground">Learning opportunity</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="animate-in slide-in-from-left-1 duration-300">
                  <div className="pt-4 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {todaysSummary.abandoned}
                    </p>
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      💡 Sometimes the best decision is knowing when to pivot
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Enhanced Development Timeline */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <GitCommit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              Development Timeline
              <Badge variant="outline" className="ml-auto">
                {developmentTimeline.length} events
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {/* Enhanced animated timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-indigo-500 opacity-20" />
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-blue-500 to-indigo-500 animate-pulse opacity-40" />

            <div className="space-y-8">
              {developmentTimeline.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <div key={index} className={cn(
                    "relative flex items-start gap-6 group",
                    "animate-in slide-in-from-left-2 duration-500",
                  )} style={{ animationDelay: `${index * 150}ms` }}>
                    {/* Enhanced timeline dot */}
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={cn(
                          "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer",
                          "group-hover:scale-110 group-hover:shadow-lg",
                          event.impact === 'high'
                            ? 'bg-green-500/20 border-green-500 text-green-600 hover:bg-green-500/30' :
                          event.impact === 'medium'
                            ? 'bg-blue-500/20 border-blue-500 text-blue-600 hover:bg-blue-500/30' :
                            'bg-orange-500/20 border-orange-500 text-orange-600 hover:bg-orange-500/30'
                        )}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{event.type} at {event.time}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Enhanced event content */}
                    <div className="flex-1 min-w-0">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Card className={cn(
                            "group/card relative overflow-hidden transition-all duration-300 cursor-pointer",
                            "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]",
                            "border-l-4 border-l-transparent hover:border-l-primary"
                          )}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-foreground text-sm group-hover/card:text-primary transition-colors">
                                    {event.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {event.description}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {event.time}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs transition-all duration-200",
                                      getEventTypeColor(event.type)
                                    )}
                                  >
                                    {event.type}
                                  </Badge>
                                </div>
                              </div>

                              <Separator className="my-3" />

                              {/* Enhanced Impact indicator with Progress */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Impact:</span>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Progress
                                        value={getImpactValue(event.impact)}
                                        className="w-16 h-2 transition-all duration-500 hover:h-3"
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className={getImpactColor(event.impact)}>
                                        {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)} impact
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover/card:opacity-100 transition-all duration-200 hover:bg-primary/10"
                                >
                                  View Details
                                  <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                event.impact === 'high'
                                  ? 'bg-green-500/20 text-green-600' :
                                event.impact === 'medium'
                                  ? 'bg-blue-500/20 text-blue-600' :
                                  'bg-orange-500/20 text-orange-600'
                              )}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              {event.title}
                            </SheetTitle>
                            <SheetDescription>
                              Detailed information about this development event
                            </SheetDescription>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {event.description}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Event Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Time:</span>
                                  <span className="text-sm font-mono">{event.time}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Date:</span>
                                  <span className="text-sm">{event.date}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Type:</span>
                                  <Badge className={getEventTypeColor(event.type)}>
                                    {event.type}
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Impact Level:</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={getImpactValue(event.impact)} className="w-20" />
                                    <span className={cn("text-sm font-medium", getImpactColor(event.impact))}>
                                      {event.impact}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}