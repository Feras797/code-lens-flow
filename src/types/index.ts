export interface Developer {
  id: string;
  name: string;
  avatar: string;
  currentTask: string;
  status: 'flow' | 'slow' | 'blocked';
  duration: string;
  fileName?: string;
}

export interface Project {
  id: string;
  name: string;
  activeDevelopers: number;
  statusDistribution: {
    active: number;
    slow: number;
    blocked: number;
  };
  lastRefresh: string;
  hasCollisions: boolean;
  developers: Developer[];
  lastUpdate: string;
}

export interface Collision {
  id: string;
  developers: string[];
  file: string;
  type: 'file' | 'feature';
}

export interface AntiPattern {
  id: string;
  title: string;
  description: string;
  example: string;
  improvement: string;
  frequency: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'pattern' | 'productivity' | 'focus';
}