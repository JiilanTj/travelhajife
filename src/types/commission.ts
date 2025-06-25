export interface Commission {
  id: string;
  agentId: string;
  registrationId: string;
  packagePrice: string;
  baseAmount: string;
  bonusAmount: string;
  totalAmount: string;
  commissionAmount: string;  // Added
  commissionRate: string;    // Added
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'PROCESS' | 'DONE';
  paymentRequestId: string | null;
  paidAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  User: {              // Added
    id: string;
    email: string;
    fullname: string;
    phone: string;
    referralCode: string;
  };
  Registration: {
    id: string;
    userId: string;
    packageId: string;
    referralCode: string;
    status: string;
    mahramId: string | null;
    mahramStatus: string | null;
    roomType: string;
    roomPreferences: {
      preferredLocation: string;
      specialNeeds: string;
      tentSection: string | null;
      dormitorySection: string | null;
    };
    roomMate: string | null;
    specialRequests: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    User: {
      id: string;
      email: string;
      fullname: string;
      phone: string;
    };
    Package: {
      id: string;
      name: string;
      type: string;
      price: string;
      departureDate: string;
    };
  };
}

export interface CommissionPaymentRequest {
  id: string;
  agentId: string;
  amount: string;
  status: 'PENDING' | 'PROCESS' | 'DONE' | 'REJECTED';
  paymentMethod: string | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
  processedBy: string | null;
  processedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  Agent: {
    fullname: string;
    email: string;
    phone: string;
  };
  Processor: {
    id: string;
    name: string;
    email: string;
  } | null;
  Commissions: {
    id: string;
    commissionAmount: string;
    status: string;
  }[];
}

export interface PaginationResponse {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface CommissionsResponse {
  status: string;
  data: Commission[];
  pagination: PaginationResponse;
}

export interface CommissionPaymentRequestsResponse {
  status: string;
  data: CommissionPaymentRequest[];
  pagination: PaginationResponse;
}

export interface ProcessPaymentRequest {
  status: 'PROCESS' | 'DONE' | 'REJECTED';
  notes: string;
}

export interface ProcessPaymentResponse {
  status: string;
  data: CommissionPaymentRequest;
}

export interface CommissionResponse {
  status: string;
  data: {
    commissions: Commission[];
    stats: {
      totalCommission: string;
      pendingCommission: string;
      paidCommission: string;
      totalJamaah: number;
    };
  };
}

export interface PaymentRequestResponse {
  status: string;
  data: CommissionPaymentRequest[];
  pagination: PaginationResponse;
}

export interface RequestPaymentPayload {
  commissionIds: string[];
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface RequestPaymentResponse {
  status: string;
  message: string;
  data: {
    requestId: string;
    amount: string;
    commissionCount: number;
  };
}

export interface AvailableCommissionsResponse {
  status: string;
  data: {
    commissions: Commission[];
    totalAvailable: string;
    pagination: PaginationResponse;
  };
}

export interface CommissionBankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
} 