export type ArticleStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type ArticleVisibility = 'PUBLIC' | 'PRIVATE' | 'PASSWORD_PROTECTED';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type OrderStatus = 'PENDING' | 'ONGOING' | 'COMPLETED';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Author {
  id: number;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: number | null;
  category: Category | null;
  authorId: number | null;
  author: Author | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Payload shape the editor sends to create/update endpoints
export interface ArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  status: ArticleStatus;
  visibility: ArticleVisibility;
  metaTitle?: string | null;
  metaDescription?: string | null;
  categoryId?: number | null;
  authorId?: number | null;
  publishedAt?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Stats {
  totalArticles: number;
  published: number;
  drafts: number;
  categories: number;
  authors: number;
}

export interface Media {
  id: number;
  fileName: string;
  url: string;
  format: string; 
  size: number; 
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  category: string | null;
  uploadedAt: string;
  articleCount: number;
}

export interface MediaDetail extends Omit<Media, 'articleCount'> {
  usedIn: { id: number; title: string; slug: string }[];
}

export interface StorageStats {
  usedBytes: number;
  quotaBytes: number;
  percent: number;
}

export interface MediaListResponse {
  items: Media[];
  total: number;
  page: number;
  pageSize: number;
  storage: StorageStats;
  categories: string[];
}

export type DateRange = 'all' | '7d' | '30d' | '90d';
export type MediaView = 'grid' | 'list';

export interface MediaListParams {
  search?: string;
  category?: string;
  range?: DateRange;
  page?: number;
  pageSize?: number;
}

export interface MediaMetadataInput {
  fileName: string;
  altText: string | null;
  caption: string | null;
  category: string | null;
}

export interface ProductCategory2 {
  id: number;
  name: string;
  slug: string;
  productCount?: number;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  brand: string | null;
  class: string | null;
  description: string | null;
  price: number | null;
  stockCount: number;
  lowStockThreshold: number;
  warehouse: string | null;
  stockStatus: StockStatus;
  category: { id: number; name: string } | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  fillRate: number;
}

export interface ProductInput {
  name: string;
  sku: string;
  brand?: string | null;
  class?: string | null;
  description?: string | null;
  categoryId?: number | null;
  price?: number | null;
  stockCount?: number;
  lowStockThreshold?: number;
}

export interface OrderItemSnapshot {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  ref: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string | null;
  items: OrderItemSnapshot[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderStats {
  pending: number;
  ongoing: number;
  completed: number;
  total: number;
}

