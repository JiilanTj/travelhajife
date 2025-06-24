import { 
  BlogStats, 
  BlogPostsResponse, 
  BlogPostResponse, 
  BlogCategoriesResponse, 
  BlogPostFilters,
  ApiResponse,
  CreateBlogPostData,
  CreateBlogPostResponse,
  UploadContentImageResponse,
  CreateBlogCategoryData,
  CreateBlogCategoryResponse
} from '@/types/blog';

const BASE_URL = "http://localhost:5000/api";

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

// Get blog statistics
export const getBlogStats = async (): Promise<BlogStats> => {
  try {
    const response = await fetch(`${BASE_URL}/blog/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json() as ApiResponse<BlogStats>;
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.data as unknown as string : undefined);
    }

    return data.data;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

// Helper function to build query string
const buildQueryString = (filters: BlogPostFilters): string => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.status) params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  return params.toString();
};

// Get all blog posts with filters
export const getAllBlogPosts = async (filters: BlogPostFilters = {}): Promise<BlogPostsResponse> => {
  try {
    const queryString = buildQueryString({
      page: 1,
      limit: 10,
      status: 'published',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      ...filters
    });

    const response = await fetch(`${BASE_URL}/blog/posts?${queryString}`);
    const data = await response.json() as BlogPostsResponse;
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.data as unknown as string : undefined);
    }

    return data;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

// Get blog post by ID
export const getBlogPostById = async (id: string): Promise<BlogPostResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/blog/posts/${id}`);
    const data = await response.json() as BlogPostResponse;
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.data as unknown as string : undefined);
    }

    return data;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

// Get all blog categories
export const getAllBlogCategories = async (page: number = 1, limit: number = 10): Promise<BlogCategoriesResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/blog/categories?page=${page}&limit=${limit}`);
    const data = await response.json() as BlogCategoriesResponse;
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.data as unknown as string : undefined);
    }

    return data;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

// Create a new blog post
export const createBlogPost = async (data: CreateBlogPostData, featuredImage?: File): Promise<CreateBlogPostResponse> => {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    const response = await fetch(`${BASE_URL}/blog/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const responseData = await response.json() as CreateBlogPostResponse;
    
    if (!response.ok) {
      handleApiError(response.status, responseData.status === 'error' ? responseData.data as unknown as string : undefined);
    }

    return responseData;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

// Upload content image
export const uploadContentImage = async (image: File): Promise<UploadContentImageResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', image);

    const response = await fetch(`${BASE_URL}/blog/upload-content-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json() as UploadContentImageResponse;
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.data as unknown as string : undefined);
    }

    return data;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

export const createBlogCategory = async (data: CreateBlogCategoryData): Promise<CreateBlogCategoryResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/blog/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create blog category');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating blog category:', error);
    throw error;
  }
};

// Update blog post
export const updateBlogPost = async (id: string, data: Partial<CreateBlogPostData>, featuredImage?: File): Promise<CreateBlogPostResponse> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    const response = await fetch(`${BASE_URL}/blog/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      handleApiError(response.status, responseData.status === 'error' ? responseData.data as unknown as string : undefined);
    }

    return responseData;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
};

// Delete blog post
export const deleteBlogPost = async (id: string): Promise<{ status: string; message: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/blog/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      handleApiError(response.status, data.status === 'error' ? data.data as unknown as string : undefined);
    }

    return data;
  } catch (error) {
    console.error('Blog service error:', error);
    throw error;
  }
}; 