interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  address: string;
}

interface BankInfo {
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
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
  bloodType: string;
  emergencyContact: EmergencyContact;
  agentTierId: string | null;
  referralCode: string | null;
  totalJamaah: number;
  totalCommission: string;
  bankInfo: BankInfo;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  const { 
    page = 1, 
    limit = 10, 
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    role: 'JAMAAH',
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  const response = await fetch(`https://api.grasindotravel.id//auth/users?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}; 