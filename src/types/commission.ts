export interface Commission {
  id: string;
  agentId: string;
  registrationId: string;
  packagePrice: string;
  commissionRate: string;
  commissionAmount: string;
  status: string;
  paymentRequestId: string | null;
  paidAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  jamaahId: string;
  User: {
    fullname: string;
    email: string;
    referralCode: string;
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