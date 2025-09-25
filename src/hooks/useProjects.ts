/**
 * React Query hooks for project data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Project } from '../types';

export function useProjects(): UseQueryResult<{ projects: Project[] }> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}

export function useProjectDashboard(projectId: string): UseQueryResult<Project> {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiService.getProjectDashboard(projectId),
    enabled: !!projectId,
    refetchInterval: 15000, // Refetch every 15 seconds for live updates
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

export function useDeveloperInsights(projectId: string, userId: string, days: number = 7) {
  return useQuery({
    queryKey: ['developer-insights', projectId, userId, days],
    queryFn: () => apiService.getDeveloperInsights(projectId, userId, days),
    enabled: !!projectId && !!userId,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
