export type PaymentType = 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
export type PaymentStatus = 'PENDING' | 'VERIFYING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'gopay';

export interface CreatePaymentRequest {
  registrationId: string;
  amount: number;
  type: PaymentType;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferDate: string;
  notes?: string;
  transferProof: File;
}

export interface PaymentResponse {
  id: string;
  registrationId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferDate: string;
  transferProof: string;
  notes?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentListItem {
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
  transferProof: string;
  notes?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  registration: {
    id: string;
    status: string;
    package: {
      name: string;
      price: number;
    };
    user: {
      fullname: string;
      email: string;
      phone: string;
    };
  };
}

export interface AdminPaymentListResponse {
  data: AdminPaymentListItem[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface AdminPaymentVerifyRequest {
  status: 'PAID' | 'FAILED';
  verificationNotes?: string;
}

export interface AdminPaymentFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  type?: PaymentType;
  search?: string;
} 