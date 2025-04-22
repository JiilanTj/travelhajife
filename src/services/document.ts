import { Document, DocumentType, DocumentStatus } from '@/types/document';

const BASE_URL = 'https://api.grasindotravel.id/api';

export const getMyDocuments = async (): Promise<Document[]> => {
  try {
    const response = await fetch(`${BASE_URL}/documents/my-documents`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error fetching documents');
    }

    return data.data;
  } catch (error) {
    console.error('Document service error:', error);
    throw error;
  }
};

export const uploadDocument = async (
  type: string,
  file: File,
  number?: string,
  expiryDate?: string
): Promise<Document> => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    if (number) formData.append('number', number);
    if (expiryDate) formData.append('expiryDate', expiryDate);

    const response = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error uploading document');
    }

    return data.data;
  } catch (error) {
    console.error('Document service error:', error);
    throw error;
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error deleting document');
    }
  } catch (error) {
    console.error('Document service error:', error);
    throw error;
  }
};

export const uploadMultipleDocuments = async (
  files: { [key: string]: File },
  data: { [key: string]: { number?: string; expiryDate?: string } }
): Promise<Document[]> => {
  try {
    const formData = new FormData();
    
    // Append files
    Object.entries(files).forEach(([key, file]) => {
      formData.append(key, file);
    });

    // Append data
    formData.append('data', JSON.stringify(data));

    const response = await fetch(`${BASE_URL}/documents/upload-multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Error uploading documents');
    }

    return responseData.data;
  } catch (error) {
    console.error('Document service error:', error);
    throw error;
  }
};

// Admin Services
export interface DocumentWithUser extends Document {
  User: {
    id: string;
    fullname: string;
    email: string;
  };
}

export interface GetDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DocumentStatus;
  type?: DocumentType;
}

export interface PaginationResponse {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface GetDocumentsResponse {
  data: DocumentWithUser[];
  pagination: PaginationResponse;
}

export const getAllDocuments = async (params: GetDocumentsParams): Promise<GetDocumentsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);

    const response = await fetch(`${BASE_URL}/documents?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error fetching documents');
    }

    return {
      data: data.data,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Document service error:', error);
    throw error;
  }
};

export const verifyDocument = async (id: string): Promise<Document> => {
  try {
    const response = await fetch(`${BASE_URL}/documents/${id}/verify`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error verifying document');
    }

    return data.data;
  } catch (error) {
    console.error('Document service error:', error);
    throw error;
  }
};

export const rejectDocument = async (id: string, reason: string): Promise<Document> => {
  try {
    const response = await fetch(`${BASE_URL}/documents/${id}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error rejecting document');
    }

    return data.data;
  } catch (error) {
    console.error('Document service error:', error);
    throw error;
  }
}; 