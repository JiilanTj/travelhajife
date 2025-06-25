import { BankInfo, EmergencyContact } from './auth';

export interface AgentTierBenefits {
  description: string;
  features: string[];
}

export interface AgentTier {
  id: string;
  name: string;
  commissionAmount: string;
  bonusAmount: string;
  minimumJamaah: number;
  benefits: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentTierRequest {
  name: string;
  commissionAmount: number;
  bonusAmount: number;
  minimumJamaah: number;
  benefits: string[];
}

export interface UpdateAgentTierRequest {
  name?: string;
  commissionAmount?: number;
  bonusAmount?: number;
  minimumJamaah?: number;
  benefits?: string[];
}

export interface AgentTierListResponse {
  success: boolean;
  data: AgentTier[];
}

export interface AgentTierResponse {
  success: boolean;
  message?: string;
  data: AgentTier;
}

export interface AgentTierErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class AgentTierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentTierError';
    if (process.env.NODE_ENV === 'production') {
      this.stack = '';
    }
  }
}

export interface Agent {
  id: string;
  email: string;
  fullname: string;
  phone: string;
  address: string | null;
  role: 'AGEN';
  isActive: boolean;
  nik: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | null;
  occupation: string | null;
  education: string | null;
  bloodType: 'A' | 'B' | 'AB' | 'O' | null;
  emergencyContact: EmergencyContact;
  agentTierId: string;
  referralCode: string | null;
  totalJamaah: number;
  totalCommission: string;
  bankInfo: BankInfo;
  createdAt: string;
  updatedAt: string;
  AgentTier?: AgentTier;
}

export interface CreateAgentRequest {
  email: string;
  password: string;
  fullname: string;
  phone: string;
  agentTierId: string;
  referralCode?: string;
  bankInfo: BankInfo;
}

export interface UpdateAgentRequest {
  fullname?: string;
  phone?: string;
  agentTierId?: string;
  bankInfo?: BankInfo;
}

export interface AgentListResponse {
  success: boolean;
  data: Agent[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface AgentResponse {
  success: boolean;
  message?: string;
  data: Agent;
}

export interface AgentErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentError';
    if (process.env.NODE_ENV === 'production') {
      this.stack = '';
    }
  }
}

export interface AgentReferral {
  referralCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateReferralResponse {
  success: boolean;
  message: string;
  data: {
    referralCode: string;
  };
}

export class ReferralError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReferralError';
  }
}

export interface ReferredJamaah {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  registeredAt: string;
}

export interface NextTierInfo {
  name: string;
  jamaahNeeded: number;
  benefits: string[] | {
    description: string;
    features: string[];
  };
}

export interface AgentStats {
  tier: string;
  totalJamaah: number;
  totalCommission: string;
  currentCommission: {
    base: string;
    bonus: string;
    total: string;
  };
  nextTier: NextTierInfo;
  referredJamaah: ReferredJamaah[];
}

export interface AgentStatsResponse {
  status: string;
  data: AgentStats;
}

export interface CommissionStats {
  totalCommission: string;
  pendingCommission: string;
  paidCommission: string;
  totalJamaah: number;
}

export interface Commission {
  id: string;
  agentId: string;
  registrationId: string;
  packagePrice: string;
  commissionRate: string;
  commissionAmount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  jamaahId: string;
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
      address: string;
      role: string;
      isActive: boolean;
      nik: string | null;
      birthPlace: string | null;
      birthDate: string | null;
      gender: string | null;
      maritalStatus: string | null;
      occupation: string | null;
      education: string | null;
      bloodType: string | null;
      emergencyContact: EmergencyContact;
      agentTierId: string | null;
      referralCode: string | null;
      referredBy: string | null;
      totalJamaah: number;
      totalCommission: string;
      bankInfo: BankInfo;
      createdAt: string;
      updatedAt: string;
    };
    Package: {
      id: string;
      name: string;
      type: string;
      description: string;
      price: string;
      dp: number;
      duration: number;
      departureDate: string;
      quota: number;
      remainingQuota: number;
      facilities: string[];
      image: string;
      additionalImages: string[];
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface CommissionResponse {
  status: string;
  data: {
    commissions: Commission[];
    stats: CommissionStats;
  };
}

export interface CommissionBankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface WithdrawalCommission {
  id: string;
  commissionAmount: string;
  status: string;
}

export interface PaymentRequest {
  id: string;
  agentId: string;
  amount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  paymentMethod: string | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
  processedBy: string | null;
  processedAt: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  Commissions: WithdrawalCommission[];
}

export interface PaymentRequestResponse {
  status: string;
  data: PaymentRequest[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface RequestPaymentPayload {
  commissionIds: string[];
  bankInfo: CommissionBankInfo;
}

export interface RequestPaymentResponse {
  status: string;
  message: string;
  data: {
    requestId: string;
    amount: number;
    commissionCount: number;
  };
}

export interface RoomPreferences {
  preferredLocation: string | null;
  specialNeeds: string | null;
  tentSection: string | null;
  dormitorySection: string | null;
}

export interface RegistrationDetails {
  id: string;
  userId: string;
  packageId: string;
  referralCode: string;
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
    phone: string;
  };
  Package: {
    name: string;
    price: string;
    departureDate: string;
  };
}

export interface AvailableCommission {
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
  Registration: RegistrationDetails;
}

export interface AvailableCommissionsResponse {
  status: string;
  data: {
    commissions: AvailableCommission[];
    totalAvailable: string;
    pagination: {
      total: number;
      pages: number;
      page: number;
      limit: number;
    };
  };
} 