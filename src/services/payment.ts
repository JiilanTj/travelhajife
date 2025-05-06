import { CreatePaymentRequest, PaymentResponse } from '@/types/payment';

const BASE_URL = "https://api.grasindotravel.id/";

export interface PaymentInfo {
  registration: {
    id: string;
    status: string;
    packageName: string;
    packagePrice: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  paymentStatus: {
    totalPackagePrice: number;
    dpAmount: number;
    totalPaid: number;
    remainingAmount: number;
    isDpPaid: boolean;
    isFullyPaid: boolean;
  };
  payments: {
    id: string;
    type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
    paymentDate: string | null;
    paymentMethod: string | null;
    midtransRedirectUrl: string | null;
    midtransPaymentCode: string | null;
    midtransPaymentType: string | null;
    midtransTransactionStatus: string | null;
  }[];
  nextPayment: {
    type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
    amount: number;
    dueAmount: number;
    dueDate: string;
  } | null;
}

export interface PaymentListItem {
  id: string;
  registrationId: string;
  type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
  amount: number;
  dueAmount: number;
  dueDate: string;
  status: string;
  paymentMethod: string | null;
  midtransOrderId: string;
  midtransTransactionId: string | null;
  midtransTransactionStatus: string | null;
  midtransPaymentType: string | null;
  midtransPaymentCode: string | null;
  midtransRedirectUrl: string | null;
  paymentDate: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  Registration: {
    id: string;
    userId: string;
    packageId: string;
    status: string;
    User: {
      fullname: string;
      email: string;
      phone: string;
    };
    Package: {
      name: string;
      type: string;
      departureDate: string;
      price: number;
    };
  };
  verifier: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PaymentStatusResponse {
  paymentId: string;
  midtransOrderId: string;
  status: string;
  transactionStatus: string;
  paymentType: string;
  paymentCode: string;
}

// Add RawPaymentData interface
interface RawPaymentData {
  registrationId: string;
  type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
  amount: string;
  dueAmount: string;
  dueDate: string;
  status: string;
  Registration: {
    Package: {
      name: string;
      type: string;
      departureDate: string;
      price: string;
    };
  };
}

// Get payment information for a registration
export const getPaymentInfo = async (registrationId: string): Promise<PaymentInfo> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/info/${registrationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payment information');
    }

    return data.data;
  } catch (error) {
    console.error('Payment service error:', error);
    throw error;
  }
};

// Get all payments for current user
export const getMyPayments = async (): Promise<PaymentListItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/my-payments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payment history');
    }

    // Transform string amounts to numbers with proper typing
    const transformedData = data.data.map((payment: RawPaymentData) => ({
      ...payment,
      amount: parseFloat(payment.amount || '0') || 0,
      dueAmount: parseFloat(payment.dueAmount || '0') || 0,
      Registration: {
        ...payment.Registration,
        Package: {
          ...payment.Registration.Package,
          price: parseFloat(payment.Registration.Package.price || '0') || 0
        }
      }
    }));

    return transformedData;
  } catch (error) {
    console.error('Payment service error:', error);
    throw error;
  }
};

// Create a new payment
export const createPayment = async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
  const formData = new FormData();
  
  // Append all required fields
  formData.append('registrationId', data.registrationId);
  formData.append('amount', data.amount.toString());
  formData.append('type', data.type);
  formData.append('bankName', data.bankName);
  formData.append('accountNumber', data.accountNumber);
  formData.append('accountName', data.accountName);
  formData.append('transferDate', data.transferDate);
  
  // Append optional fields if they exist
  if (data.notes) {
    formData.append('notes', data.notes);
  }
  
  // Append the file
  formData.append('transferProof', data.transferProof);

  const response = await fetch(`${BASE_URL}/payments/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment');
  }

  const result = await response.json();
  return result.data;
};

// Check payment status
export const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  const response = await fetch(`${BASE_URL}/payments/check-status/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }

  const data = await response.json();
  return data.data;
}; 