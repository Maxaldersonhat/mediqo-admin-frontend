import { api } from '../lib/api';
import type { Product, ProductStats, ProductCategory2, ProductInput } from '../types';

interface FetchProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  stockStatus?: string;
  sortBy?: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<ProductsResponse> {
  const query = new URLSearchParams();
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 5));
  if (params.search) query.set('search', params.search);
  if (params.categoryId) query.set('categoryId', String(params.categoryId));
  if (params.stockStatus) query.set('stockStatus', params.stockStatus);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  return api.get('products', `?${query.toString()}`);
}

export async function fetchProductStats(): Promise<ProductStats> {
  return api.get('products', '/stats');
}

export async function fetchProduct(id: number): Promise<{ product: Product }> {
  return api.get('products', `/${id}`);
}

// Extends ProductInput with an explicit remove-image flag for edits.
export interface ProductUpdateInput extends Partial<ProductInput> {
  removeImage?: boolean;
}

// Only appends fields that are *present* (not merely truthy), so callers can
// clear a value by sending an empty string / null. The backend's
// parseProductBody coerces '' and null to the right thing.
function buildProductFormData(
  payload: ProductUpdateInput,
  imageFile?: File | null,
): FormData {
  const fd = new FormData();

  if (payload.name !== undefined) fd.append('name', payload.name);
  if (payload.sku !== undefined) fd.append('sku', payload.sku);
  if (payload.brand !== undefined) fd.append('brand', payload.brand ?? '');
  if (payload.class !== undefined) fd.append('class', payload.class ?? '');
  if (payload.description !== undefined) fd.append('description', payload.description ?? '');
  if (payload.categoryId !== undefined) {
    fd.append('categoryId', payload.categoryId == null ? '' : String(payload.categoryId));
  }
  if (payload.price !== undefined) {
    fd.append('price', payload.price == null ? '' : String(payload.price));
  }
  if (payload.stockCount !== undefined) fd.append('stockCount', String(payload.stockCount));
  if (payload.lowStockThreshold !== undefined) fd.append('lowStockThreshold', String(payload.lowStockThreshold));

  if (payload.removeImage) fd.append('removeImage', 'true');
  if (imageFile) fd.append('image', imageFile);

  return fd;
}

export async function createProduct(
  payload: ProductInput,
  imageFile?: File | null,
): Promise<{ product: Product }> {
  return api.post('products', '', buildProductFormData(payload, imageFile));
}

export async function updateProduct(
  id: number,
  payload: ProductUpdateInput,
  imageFile?: File | null,
): Promise<{ product: Product }> {
  return api.put('products', `/${id}`, buildProductFormData(payload, imageFile));
}

export async function deleteProduct(id: number): Promise<void> {
  return api.del('products', `/${id}`);
}

export async function bulkDeleteProducts(ids: number[]): Promise<{ deleted: number }> {
  return api.post('products', '/bulk-delete', { ids });
}

export async function fetchProductCategories(): Promise<{ categories: ProductCategory2[] }> {
  return api.get('productCategories');
}

export async function createProductCategory(name: string): Promise<{ category: ProductCategory2 }> {
  return api.post('productCategories', '', { name });
}