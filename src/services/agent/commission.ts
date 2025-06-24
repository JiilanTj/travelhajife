import { CommissionResponse, PaymentRequestResponse, RequestPaymentPayload, RequestPaymentResponse, AvailableCommissionsResponse } from '@/types/agent';

const BASE_URL = "http://localhost:5000/api";

export const getMyCommissions = async (): Promise<CommissionResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/commission/my-commissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch commission data');
    }

    return data;
  } catch (error) {
    console.error('Error fetching commission data:', error);
    throw error;
  }
};

export const getAvailableCommissions = async (): Promise<AvailableCommissionsResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/commission/available-commissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch available commissions');
    }

    return data;
  } catch (error) {
    console.error('Error fetching available commissions:', error);
    throw error;
  }
};

export const getMyPaymentRequests = async (): Promise<PaymentRequestResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/commission/my-payment-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payment requests');
    }

    return data;
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    throw error;
  }
};

export const requestPayment = async (payload: RequestPaymentPayload): Promise<RequestPaymentResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/commission/request-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit payment request');
    }

    return data;
  } catch (error) {
    console.error('Error submitting payment request:', error);
    throw error;
  }
}; 