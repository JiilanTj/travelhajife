// Gallery Item Type
export interface GalleryItem {
  id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface CreateGalleryResponse {
  status: string;
  message: string;
  data: GalleryItem;
}

export interface DeleteGalleryResponse {
  status: string;
  message: string;
}

// Request Types
export interface CreateGalleryData {
  name: string;
  image: File;
}

export interface UpdateGalleryData {
  name?: string;
  image?: File;
} 