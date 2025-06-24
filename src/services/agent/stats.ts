import { AgentStatsResponse } from '@/types/agent';

const BASE_URL = "http://localhost:5000/api";

export const getAgentStats = async (): Promise<AgentStatsResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/commission/my-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch agent stats');
    }

    return data;
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    throw error;
  }
}; 