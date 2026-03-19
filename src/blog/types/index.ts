// Blog Types - Completamente isolado do resto do projeto

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  
  // Relations
  authorId: string;
  author?: Author;
  categoryId?: string;
  category?: Category;
  tags?: Tag[];
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  
  // Images
  featuredImage?: string;
  featuredImageAlt?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  
  // Metadata
  viewCount: number;
  readingTimeMinutes: number;
  publishedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostFilters {
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  search?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface BlogRepository {
  // Posts
  getPosts(filters?: PostFilters, pagination?: PaginationOptions): Promise<Post[]>;
  getPostById(id: string): Promise<Post | null>;
  getPostBySlug(slug: string): Promise<Post | null>;
  createPost(data: Partial<Post>): Promise<Post>;
  updatePost(data: Partial<Post> & { id: string }): Promise<Post>;
  deletePost(id: string): Promise<void>;
  incrementViewCount(id: string): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  
  // Authors
  getAuthors(): Promise<Author[]>;
  getAuthorBySlug(slug: string): Promise<Author | null>;
  
  // Tags
  getTags(): Promise<Tag[]>;
  getTagBySlug(slug: string): Promise<Tag | null>;
}
