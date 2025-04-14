export type PackageType = 'UMROH' | 'HAJI';

export interface PackageImage {
  path: string;
  url: string;
}

export interface Package {
  id: string;
  name: string;
  type: PackageType;
  description: string;
  price: string;
  dp: number;
  duration: number;
  departureDate: string;
  quota: number;
  remainingQuota: number;
  facilities: string[];
  image: PackageImage;
  additionalImages: PackageImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackageResponse {
  status: 'success' | 'error';
  data: Package[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  filters: {
    search?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    startDate?: string;
    endDate?: string;
  };
  sorting: {
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  };
} 