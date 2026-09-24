import { API_BASE_URLS, api } from '../lib/api';
import type { Article, ArticleInput, Category, PaginatedResponse } from '../types';


interface FetchArticlesFilters {
  status?: string;
  categoryId?: number;
  q?: string;
}

// ---- Authenticated (admin) endpoints — go through `api` so the JWT ----
// ---- from localStorage is attached, and a 401 redirects to /login.  ----

export async function fetchArticles(
  page: number = 1,
  pageSize: number = 10,
  filters: FetchArticlesFilters = {}
): Promise<PaginatedResponse<Article>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.status) params.set('status', filters.status);
  if (filters.categoryId) params.set('categoryId', String(filters.categoryId));
  if (filters.q) params.set('q', filters.q);

  return api.get('articles', `?${params.toString()}`);
}

export async function fetchArticle(id: number): Promise<Article> {
  return api.get('articles', `/${id}`);
}

export async function createArticle(payload: ArticleInput): Promise<Article> {
  return api.post('articles', '', payload);
}

export async function updateArticle(
  id: number,
  payload: Partial<ArticleInput>
): Promise<Article> {
  return api.patch('articles', `/${id}`, payload);
}

export async function deleteArticle(id: number): Promise<void> {
  await api.del('articles', `/${id}`);
}

export interface SlugCheckResult {
  available: boolean;
  slug: string;
  suggested?: string;
}

export async function checkSlugAvailability(
  slug: string,
  excludeId?: number
): Promise<SlugCheckResult> {
  const params = new URLSearchParams({ slug });
  if (excludeId) params.set('excludeId', String(excludeId));
  return api.get('checkSlug', `?${params.toString()}`);
}

export async function fetchCategories(): Promise<Category[]> {
  return api.get('categories');
}

// ---- Public (unauthenticated) endpoints — used by marketing pages,   ----
// ---- deliberately kept on plain fetch: no JWT to attach, and a 401   ----
// ---- redirect-to-/login would be wrong on a public-facing page.      ----

// Public lookup used by the marketing-facing /insights/[slug] page.
// Returns null (not a thrown error) on 404 so the page can call notFound().
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const res = await fetch(`${API_BASE_URLS.articles}/by-slug/${slug}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch article');
  return res.json();
}

// Slim list of published articles, used to build the sitemap.
export async function fetchPublishedArticles(): Promise<{ slug: string; updatedAt: string }[]> {
  const res = await fetch(`${API_BASE_URLS.articles}/published`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch published articles');
  return res.json();
}

export const createCategory = async (name: string): Promise<Category> => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const CATEGORIES_API_URL = import.meta.env.VITE_CATEGORIES_API_URL || 'http://localhost:3000/api/categories';
  const token = localStorage.getItem('token');

  const res = await fetch(CATEGORIES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, slug }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || 'Failed to create category');
  }

  return res.json();
};