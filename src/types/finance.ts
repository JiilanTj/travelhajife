// Dashboard Statistics
export interface FinanceDashboardStats {
  totalIncome: number;
  monthlyIncome: number;
  pendingAmount: number;
  totalCommissionPaid: number;
  netIncome: number;
}

// Payment Types
export interface RoomPreferences {
  preferredLocation: string;
  specialNeeds: string;
  tentSection: string | null;
  dormitorySection: string | null;
}

export interface Registration {
  id: string;
  userId: string;
  packageId: string;
  referralCode: string | null;
  status: string;
  mahramId: string | null;
  mahramStatus: string | null;
  roomType: string;
  roomPreferences: RoomPreferences;
  roomMate: string | null;
  specialRequests: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  User: {
    fullname: string;
    email: string;
  };
  Package: {
    name: string;
    type: string;
  };
}

export interface Payment {
  id: string;
  registrationId: string;
  type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
  amount: string;
  dueAmount: string;
  dueDate: string;
  status: string;
  paymentMethod: string | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferDate: string;
  transferProof: string;
  paymentDate: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  verificationNotes: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  Registration: Registration;
}

export interface PaymentResponse {
  payments: Payment[];
  totals: {
    [key: string]: string;
  };
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

// Commission Payment Types
export interface CommissionPayment {
  id: string;
  agentId: string;
  amount: string;
  status: string;
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
}

export interface CommissionPaymentResponse {
  commissionPayments: CommissionPayment[];
  totals: {
    [key: string]: string;
  };
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

// Package Types
export interface PackageFinance {
  id: string;
  name: string;
  type: string;
  departureDate: string;
  price: string;
  quota: number;
  remainingQuota: number;
  registrations: number;
  totalRevenue: number;
}

export interface PackageFinanceResponse {
  packages: PackageFinance[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
} 