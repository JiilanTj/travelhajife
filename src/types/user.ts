export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'AGEN' | 'MARKETING' | 'JAMAAH';
export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type BloodType = 'A' | 'B' | 'AB' | 'O';

export interface EmergencyContact {
  name: string | null;
  relation: string | null;
  phone: string | null;
  address: string | null;
}

export interface BankInfo {
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  phone: string;
  address: string | null;
  role: UserRole;
  isActive: boolean;
  nik: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  gender: Gender | null;
  maritalStatus: MaritalStatus | null;
  occupation: string | null;
  education: string | null;
  bloodType: BloodType | null;
  emergencyContact: EmergencyContact;
  agentTierId: string | null;
  referralCode: string | null;
  totalJamaah: number;
  totalCommission: string;
  bankInfo: BankInfo;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
} 