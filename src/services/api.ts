/**
 * API service for CodeLens Analytics
 * Connects to the Python FastAPI backend with Supabase integration
 */

import { Project, Developer, Collision } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Projects API
  async getProjects(): Promise<{ projects: Project[] }> {
    return this.request<{ projects: Project[] }>('/api/projects');
  }

  async getProjectDashboard(projectId: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}/dashboard`);
  }

  // Developer Insights API
  async getDeveloperInsights(projectId: string, userId: string, days: number = 7) {
    return this.request(`/api/projects/${projectId}/developers/${userId}/insights?days=${days}`);
  }

  // Chat Logs API
  async createChatLog(chatLog: {
    user_query: string;
    claude_response: string;
    user_id: string;
    project_id: string;
    interaction_timestamp: string;
  }) {
    return this.request('/api/chat-logs', {
      method: 'POST',
      body: JSON.stringify(chatLog),
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/api/health');
  }
}

export const apiService = new ApiService();
export default apiService;
