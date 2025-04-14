export interface Registration {
  id: string;
  userId: string;
  packageId: string;
  Package: {
    name: string;
    type: string;
    departureDate: string;
    price: string;
    dp: number;
  };
  registrationNumber?: string;
  roomType: string;
  roomPreferences: {
    preferredLocation: string | null;
    specialNeeds: string | null;
    tentSection: string | null;
    dormitorySection: string | null;
  };
  specialRequests: string | null;
  status: 'DRAFT' | 'WAITING_PAYMENT' | 'DOCUMENT_REVIEW' | 'DOCUMENT_REJECTED' | 'APPROVED' | 'CANCELLED' | 'COMPLETED';
  updatedAt: string;
  createdAt: string;
  referralCode: string | null;
  mahramId: string | null;
  mahramStatus: string | null;
  roomMate: string | null;
  notes: string | null;
  documents?: Array<{
    id: string;
    type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    file: string;
  }>;
}

export interface RegistrationResponse {
  status: string;
  message: string;
  data: Registration[];
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
} 