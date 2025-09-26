/**
 * Live Team Status Component
 * Replaces mock data with real Supabase data
 */

import React from 'react';
import { useProjectDashboard } from '../hooks/useProjects';
import { TeamStatus } from './sections/TeamStatus';
import { StealthCard } from './ui/stealth-card';
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface LiveTeamStatusProps {
  projectId: string;
}

export function LiveTeamStatus({ projectId }: LiveTeamStatusProps) {
  const { data: project, isLoading, error, isRefetching } = useProjectDashboard(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-foreground-muted">Loading team status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <StealthCard className="p-8" variant="glass">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Failed to load team status
            </h3>
            <p className="text-foreground-muted mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </StealthCard>
    );
  }

  if (!project) {
    return (
      <StealthCard className="p-8" variant="glass">
        <div className="text-center space-y-4">
          <WifiOff className="w-12 h-12 mx-auto text-foreground-muted" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No team activity
            </h3>
            <p className="text-foreground-muted">
              No recent Claude conversations found for this project.
            </p>
          </div>
        </div>
      </StealthCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {isRefetching ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Wifi className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm text-foreground-muted">
              {isRefetching ? 'Updating...' : 'Live'}
            </span>
          </div>
        </div>
        <div className="text-xs text-foreground-muted">
          Last updated: {project.lastRefresh}
        </div>
      </div>

      {/* Team Status Component */}
      <TeamStatus project={project} />
    </div>
  );
}
