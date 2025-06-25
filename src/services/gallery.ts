import { 
  GalleryItem, 
  ApiResponse, 
  CreateGalleryResponse, 
  DeleteGalleryResponse,
  CreateGalleryData,
  UpdateGalleryData
} from '@/types/gallery';

const BASE_URL = "https://api.grasindotravel.id/api";

// Helper function to handle API errors
const handleApiError = (status: number, message?: string) => {
  switch (status) {
    case 404:
      throw new Error(message || 'Data tidak ditemukan');
    case 401:
      throw new Error(message || 'Unauthorized access');
    case 403:
      throw new Error(message || 'Forbidden access');
    default:
      throw new Error(message || 'Terjadi kesalahan pada server');
  }
};

// Get all gallery items
export const getAllGalleryItems = async (): Promise<ApiResponse<GalleryItem[]>> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/gallery`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json() as ApiResponse<GalleryItem[]>;
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.data as unknown as string : undefined);
    }

    return data;
  } catch (error) {
    console.error('Gallery service error:', error);
    throw error;
  }
};

// Create a new gallery item
export const createGalleryItem = async (data: CreateGalleryData): Promise<CreateGalleryResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('image', data.image);

    const response = await fetch(`${BASE_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseData = await response.json() as CreateGalleryResponse;
    
    if (!response.ok) {
      handleApiError(response.status, responseData.status === 'error' ? responseData.data as unknown as string : undefined);
    }

    return responseData;
  } catch (error) {
    console.error('Gallery service error:', error);
    throw error;
  }
};

// Update gallery item
export const updateGalleryItem = async (id: string, data: UpdateGalleryData): Promise<CreateGalleryResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.image) formData.append('image', data.image);

    const response = await fetch(`${BASE_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseData = await response.json() as CreateGalleryResponse;
    
    if (!response.ok) {
      handleApiError(response.status, responseData.status === 'error' ? responseData.data as unknown as string : undefined);
    }

    return responseData;
  } catch (error) {
    console.error('Gallery service error:', error);
    throw error;
  }
};

// Delete gallery item
export const deleteGalleryItem = async (id: string): Promise<DeleteGalleryResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json() as DeleteGalleryResponse;
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.message : undefined);
    }

    return data;
  } catch (error) {
    console.error('Gallery service error:', error);
    throw error;
  }
}; 