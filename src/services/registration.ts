const BASE_URL = "https://api.grasindotravel.id/";

interface RegistrationRequest {
  packageId: string;
  roomType: string;
  roomPreferences: {
    preferredLocation?: string;
    specialNeeds?: string | null;
    tentSection?: string | null;
    dormitorySection?: string | null;
  };
  specialRequests?: string | null;
  referralCode?: string | null;
}

interface RegistrationResponse {
  status: string;
  message: string;
  data: {
    id: string;
    userId: string;
    packageId: string;
    roomType: string;
    roomPreferences: {
      preferredLocation: string | null;
      specialNeeds: string | null;
      tentSection: string | null;
      dormitorySection: string | null;
    };
    specialRequests: string | null;
    status: string;
    updatedAt: string;
    createdAt: string;
    referralCode: string | null;
    mahramId: string | null;
    mahramStatus: string | null;
    roomMate: string | null;
    notes: string | null;
  };
}

export const startRegistration = async (data: RegistrationRequest): Promise<RegistrationResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/registrations/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to start registration');
    }

    return result;
  } catch (error) {
    console.error('Registration service error:', error);
    throw error;
  }
};

export const getMyRegistrations = async () => {
  try {
    const response = await fetch(`${BASE_URL}/registrations/my-registrations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch registrations');
    }

    return data;
  } catch (error) {
    console.error('Registration service error:', error);
    throw error;
  }
};

export const getRegistrationDetail = async (id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/registrations/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch registration detail');
    }

    return data;
  } catch (error) {
    console.error('Registration service error:', error);
    throw error;
  }
};

export const cancelRegistration = async (id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/registrations/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel registration');
    }

    return data;
  } catch (error) {
    console.error('Registration service error:', error);
    throw error;
  }
}; 