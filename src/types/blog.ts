// Blog Statistics Types
export interface TopPost {
  title: string;
  views: number;
  status: string;
  publishedAt: string;
}

export interface PostsByStatus {
  published: number;
  draft: number;
  archived: number;
}

export interface BlogViews {
  total: number;
  topPosts: TopPost[];
}

export interface BlogStats {
  totalPosts: number;
  postsByStatus: PostsByStatus;
  totalCategories: number;
  views: BlogViews;
}

export interface BlogStatsResponse {
  status: string;
  data: BlogStats;
}

// Blog Post Filters
export interface BlogPostFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: 'published' | 'draft' | 'archived' | 'all';
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'ASC' | 'DESC';
}

// Featured Image Type
export interface FeaturedImage {
  path: string;
  url: string;
}

// Blog Author Type
export interface BlogAuthor {
  id: string;
  fullname: string;
  email: string;
}

// Blog Category Type
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Blog Post Type
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: FeaturedImage | null;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'published' | 'draft' | 'archived';
  publishedAt: string;
  authorId: string;
  categoryId: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: BlogAuthor;
  category: BlogCategory;
}

// Pagination Type
export interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: Pagination;
}

// Specific Response Types
export type BlogPostsResponse = PaginatedApiResponse<BlogPost[]>;
export type BlogPostResponse = ApiResponse<BlogPost>;
export type BlogCategoriesResponse = PaginatedApiResponse<BlogCategory[]>;

// Create Blog Post Types
export interface CreateBlogPostData {
  title: string;
  content: string;
  categoryId: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface UploadImageResponse {
  filename: string;
  path: string;
  url: string;
}

export interface CreateBlogPostResponse extends ApiResponse<BlogPost> {
  message: string;
}

export interface UploadContentImageResponse extends ApiResponse<UploadImageResponse> {
  message: string;
}

export interface CreateBlogCategoryData {
  name: string;
  description: string;
}

export interface CreateBlogCategoryResponse {
  status: string;
  message: string;
  data: BlogCategory;
} 