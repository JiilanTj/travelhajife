export interface LoginCredentials {
  email: string;
  password: string;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  address: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  phone: string;
  address: string;
  role: string;
  isActive: boolean;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  occupation: string;
  education: string;
  bloodType: 'A' | 'B' | 'AB' | 'O';
  emergencyContact: EmergencyContact;
  agenttierid: string | null;
  referralcode: string | null;
  totaljamaah: number;
  totalcommission: string;
  bankinfo: BankInfo | null;
  createdAt: string;
  updatedAt: string;
  AgentTierId: string | null;
}

export interface LoginResponse {
  status: string;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ValidateTokenResponse {
  status: string;
  data: User;
}

export interface LogoutResponse {
  status: 'success' | 'error';
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullname: string;
  phone: string;
  address: string;
  referralCode?: string;
}

export interface UpdateProfileData {
  fullname?: string;
  phone?: string;
  address?: string;
  nik?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: 'MALE' | 'FEMALE';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  occupation?: string;
  education?: string;
  bloodType?: 'A' | 'B' | 'AB' | 'O';
  emergencyContact?: EmergencyContact;
}

export interface UpdateProfileResponse {
  status: string;
  message: string;
  data: User;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
    if (process.env.NODE_ENV === 'production') {
      this.stack = '';
    }
  }
}