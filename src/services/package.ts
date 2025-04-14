import { Package, PackageResponse } from "@/types/package";

const BASE_URL = "http://localhost:5000/api";

interface GetPackagesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  minDuration?: string | number;
  maxDuration?: string | number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const getPackages = async (params: GetPackagesParams = {}): Promise<PackageResponse> => {
  try {
    const queryParams = new URLSearchParams();

    // Set default params and merge with provided params
    const finalParams = {
      isActive: true, // Default to true
      ...params,      // Allow override from params
    };

    if (finalParams.page) queryParams.append('page', finalParams.page.toString());
    if (finalParams.limit) queryParams.append('limit', finalParams.limit.toString());
    if (finalParams.search) queryParams.append('search', finalParams.search);
    if (finalParams.type) queryParams.append('type', finalParams.type);
    if (finalParams.minPrice) queryParams.append('minPrice', finalParams.minPrice.toString());
    if (finalParams.maxPrice) queryParams.append('maxPrice', finalParams.maxPrice.toString());
    if (finalParams.minDuration) queryParams.append('minDuration', finalParams.minDuration.toString());
    if (finalParams.maxDuration) queryParams.append('maxDuration', finalParams.maxDuration.toString());
    if (finalParams.startDate) queryParams.append('startDate', finalParams.startDate);
    if (finalParams.endDate) queryParams.append('endDate', finalParams.endDate);
    // Always send isActive parameter
    queryParams.append('isActive', finalParams.isActive.toString());

    const response = await fetch(
      `${BASE_URL}/packages?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error fetching packages');
    }

    return data;
  } catch (error) {
    console.error('Package service error:', error);
    throw error;
  }
};

export const getPackage = async (id: string): Promise<Package> => {
  try {
    const response = await fetch(`${BASE_URL}/packages/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error fetching package');
    }

    return data.data;
  } catch (error) {
    console.error('Package service error:', error);
    throw error;
  }
};

export const createPackage = async (formData: FormData): Promise<Package> => {
  try {
    const response = await fetch(`${BASE_URL}/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error creating package');
    }

    return data.data;
  } catch (error) {
    console.error('Package service error:', error);
    throw error;
  }
};

export const updatePackage = async (id: string, formData: FormData): Promise<Package> => {
  try {
    const response = await fetch(`${BASE_URL}/packages/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error updating package');
    }

    return data.data;
  } catch (error) {
    console.error('Package service error:', error);
    throw error;
  }
};

export const deletePackage = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/packages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error deleting package');
    }
  } catch (error) {
    console.error('Package service error:', error);
    throw error;
  }
}; 