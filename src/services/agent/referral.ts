import { GenerateReferralResponse, ReferralError } from '@/types/agent';

const BASE_URL = "https://api.grasindotravel.id/";

interface CheckReferralResponse {
  success: boolean;
  hasReferral: boolean;
  message: string;
  data: {
    referralCode: string | null;
  };
}

export const checkReferral = async (): Promise<CheckReferralResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ReferralError('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/commission/check-referral`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new ReferralError(data.message || 'Failed to check referral status');
    }

    return data;
  } catch (error) {
    if (error instanceof ReferralError) {
      throw error;
    }
    throw new ReferralError('Failed to check referral status');
  }
};

export const generateReferralCode = async (): Promise<GenerateReferralResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new ReferralError('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/commission/generate-referral`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new ReferralError(data.message || 'Failed to generate referral code');
    }

    return data;
  } catch (error) {
    if (error instanceof ReferralError) {
      throw error;
    }
    throw new ReferralError('Failed to generate referral code');
  }
}; 