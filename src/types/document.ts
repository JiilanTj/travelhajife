export type DocumentType = 'KTP' | 'PASSPORT' | 'KK' | 'FOTO' | 'VAKSIN' | 'BUKU_NIKAH' | 'IJAZAH';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Document {
  id: string;
  type: DocumentType;
  number?: string;
  expiryDate?: string;
  file: {
    path: string;
    url: string;
  };
  status: DocumentStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
} 