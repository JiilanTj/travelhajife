import { BankInfo, EmergencyContact } from './auth';

export interface AgentTierBenefits {
  description: string;
  features: string[];
}

export interface AgentTier {
  id: string;
  name: string;
  baseCommissionRate: string;
  minimumJamaah: number;
  bonusRate: string;
  benefits: AgentTierBenefits;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentTierRequest {
  name: string;
  baseCommissionRate: number;
  minimumJamaah: number;
  bonusRate: number;
  benefits: AgentTierBenefits;
}

export interface UpdateAgentTierRequest {
  name?: string;
  baseCommissionRate?: number;
  minimumJamaah?: number;
  bonusRate?: number;
  benefits?: AgentTierBenefits;
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