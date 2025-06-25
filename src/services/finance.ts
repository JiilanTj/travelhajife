import { FinanceDashboardStats, PaymentResponse, CommissionPaymentResponse, PackageFinanceResponse } from '@/types/finance';

const BASE_URL = "https://api.grasindotravel.id/api";

// Get finance dashboard statistics
export const getFinanceDashboardStats = async (): Promise<FinanceDashboardStats> => {
  try {
    const response = await fetch(`${BASE_URL}/finance/dashboard`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch finance dashboard statistics');
    }

    return data.data;
  } catch (error) {
    console.error('Finance service error:', error);
    throw error;
  }
};

// Get all payments
export const getAllPayments = async (): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/finance/payments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payments');
    }

    return data.data;
  } catch (error) {
    console.error('Finance service error:', error);
    throw error;
  }
};

// Get all commission payments
export const getAllCommissionPayments = async (): Promise<CommissionPaymentResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/finance/commissions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch commission payments');
    }

    return data.data;
  } catch (error) {
    console.error('Finance service error:', error);
    throw error;
  }
};

// Get all packages with financial data
export const getPackagesFinancial = async (): Promise<PackageFinanceResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/finance/packages`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch packages financial data');
    }

    return data.data;
  } catch (error) {
    console.error('Finance service error:', error);
    throw error;
  }
}; 