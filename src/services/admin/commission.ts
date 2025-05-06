import { 
  CommissionsResponse, 
  CommissionPaymentRequestsResponse, 
  ProcessPaymentRequest, 
  ProcessPaymentResponse 
} from '@/types/commission';

const BASE_URL = "http://localhost:5000/api";

// Get all commissions
export const getAllCommissions = async (): Promise<CommissionsResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/commission`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch commissions');
    }

    return data;
  } catch (error) {
    console.error('Error fetching commissions:', error);
    throw error;
  }
};

// Get all commission payment requests
export const getAllPaymentRequests = async (): Promise<CommissionPaymentRequestsResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/commission/payment-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
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

// Process a payment request
export const processPaymentRequest = async (
  requestId: string,
  processData: ProcessPaymentRequest
): Promise<ProcessPaymentResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await fetch(`${BASE_URL}/commission/payment-requests/${requestId}/process`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to process payment request');
    }

    return data;
  } catch (error) {
    console.error('Error processing payment request:', error);
    throw error;
  }
}; 