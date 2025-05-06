import { 
  CreateAgentRequest, 
  UpdateAgentRequest, 
  AgentListResponse, 
  AgentResponse,
  AgentError,
  Agent
} from '@/types/agent';

const BASE_URL = "http://localhost:5000/api";

export const createAgent = async (data: CreateAgentRequest): Promise<Agent> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentError('No token found');
    }

    const response = await fetch(`${BASE_URL}/agents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: AgentResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new AgentError(result.message || 'Failed to create agent');
    }

    return result.data;
  } catch (error) {
    console.error('Agent service error:', error);
    if (error instanceof AgentError) {
      throw error;
    }
    throw new AgentError('Failed to create agent');
  }
};

export const getAgents = async (page = 1, limit = 10, search = ''): Promise<AgentListResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentError('No token found');
    }

    const url = new URL(`${BASE_URL}/agents`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (search) {
      url.searchParams.append('search', search);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: AgentListResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new AgentError('Failed to fetch agents');
    }

    return data;
  } catch (error) {
    console.error('Agent service error:', error);
    if (error instanceof AgentError) {
      throw error;
    }
    throw new AgentError('Failed to fetch agents');
  }
};

export const updateAgent = async (id: string, data: UpdateAgentRequest): Promise<Agent> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentError('No token found');
    }

    const response = await fetch(`${BASE_URL}/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: AgentResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new AgentError(result.message || 'Failed to update agent');
    }

    return result.data;
  } catch (error) {
    console.error('Agent service error:', error);
    if (error instanceof AgentError) {
      throw error;
    }
    throw new AgentError('Failed to update agent');
  }
};

export const deactivateAgent = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentError('No token found');
    }

    const response = await fetch(`${BASE_URL}/agents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AgentError(error.message || 'Failed to deactivate agent');
    }
  } catch (error) {
    console.error('Agent service error:', error);
    if (error instanceof AgentError) {
      throw error;
    }
    throw new AgentError('Failed to deactivate agent');
  }
}; 