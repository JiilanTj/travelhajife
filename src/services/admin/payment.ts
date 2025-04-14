import { PaymentListItem } from '../payment';
import { AdminPaymentListResponse, AdminPaymentFilters, AdminPaymentVerifyRequest, PaymentResponse, PaymentType, PaymentStatus } from '@/types/payment';

const BASE_URL = "http://localhost:5000/api";

interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Interface for the raw API response structure
interface RawPaymentData {
  id: string;
  registrationId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferDate: string;
  transferProof: {
    path: string;
    url: string;
  };
  notes?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  Registration: {
    id: string;
    status: string;
    Package: {
      name: string;
      price: string;
    };
    User: {
      fullname: string;
      email: string;
      phone: string;
    };
  };
}

export const getPayments = async (params: GetPaymentsParams = {}): Promise<PaginatedResponse<PaymentListItem>> => {
  const { page = 1, limit = 10, search = '' } = params;
  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const response = await fetch(`http://localhost:5000/api/payments?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }

  return response.json();
};

// Admin: Get all payments with filters
export const getAllPayments = async (filters: AdminPaymentFilters = {}): Promise<AdminPaymentListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.search) queryParams.append('search', filters.search);

    const response = await fetch(`${BASE_URL}/payments?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch payments');
    }

    const data = await response.json();
    
    // Log the raw response for debugging
    console.log('Raw API Response:', data);

    // Ensure the response matches our expected type
    const transformedData: AdminPaymentListResponse = {
      data: data.data.map((payment: RawPaymentData) => ({
        ...payment,
        transferProof: payment.transferProof.url,
        registration: {
          id: payment.Registration?.id,
          status: payment.Registration?.status,
          package: {
            name: payment.Registration?.Package?.name,
            price: parseFloat(payment.Registration?.Package?.price || '0'),
          },
          user: {
            fullname: payment.Registration?.User?.fullname,
            email: payment.Registration?.User?.email,
            phone: payment.Registration?.User?.phone,
          },
        },
      })),
      pagination: data.pagination,
    };

    return transformedData;
  } catch (error) {
    console.error('Payment service error:', error);
    throw error;
  }
};

// Admin: Verify payment
export const verifyPayment = async (paymentId: string, verifyData: AdminPaymentVerifyRequest): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/${paymentId}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(verifyData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify payment');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Payment service error:', error);
    throw error;
  }
}; 