import { 
  CreateAgentTierRequest, 
  UpdateAgentTierRequest, 
  AgentTierListResponse, 
  AgentTierResponse,
  AgentTierError,
  AgentTier
} from '@/types/agent';

const BASE_URL = "https://api.grasindotravel.id/api";

export const createAgentTier = async (data: CreateAgentTierRequest): Promise<AgentTier> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentTierError('No token found');
    }

    const response = await fetch(`${BASE_URL}/agents/tiers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: AgentTierResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new AgentTierError(result.message || 'Failed to create agent tier');
    }

    return result.data;
  } catch (error) {
    console.error('Agent tier service error:', error);
    if (error instanceof AgentTierError) {
      throw error;
    }
    throw new AgentTierError('Failed to create agent tier');
  }
};

export const getAgentTiers = async (): Promise<AgentTierListResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentTierError('No token found');
    }

    const response = await fetch(`${BASE_URL}/agents/tiers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: AgentTierListResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new AgentTierError('Failed to fetch agent tiers');
    }

    return data;
  } catch (error) {
    console.error('Agent tier service error:', error);
    if (error instanceof AgentTierError) {
      throw error;
    }
    throw new AgentTierError('Failed to fetch agent tiers');
  }
};

export const updateAgentTier = async (id: string, data: UpdateAgentTierRequest): Promise<AgentTier> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentTierError('No token found');
    }

    const response = await fetch(`${BASE_URL}/agents/tiers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: AgentTierResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new AgentTierError(result.message || 'Failed to update agent tier');
    }

    return result.data;
  } catch (error) {
    console.error('Agent tier service error:', error);
    if (error instanceof AgentTierError) {
      throw error;
    }
    throw new AgentTierError('Failed to update agent tier');
  }
};

export const deleteAgentTier = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AgentTierError('No token found');
    }

    const response = await fetch(`${BASE_URL}/agents/tiers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AgentTierError(error.message || 'Failed to delete agent tier');
    }
  } catch (error) {
    console.error('Agent tier service error:', error);
    if (error instanceof AgentTierError) {
      throw error;
    }
    throw new AgentTierError('Failed to delete agent tier');
  }
}; 