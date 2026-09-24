export const API_BASE_URLS = {
  articles: import.meta.env.VITE_ARTICLES_API_URL || '/api/articles',
  stats: import.meta.env.VITE_STATS_API_URL || '/api/stats',
  categories: import.meta.env.VITE_CATEGORIES_API_URL || '/api/categories',
  authors: import.meta.env.VITE_AUTHORS_API_URL || '/api/authors',
  checkSlug: import.meta.env.VITE_ARTICLES_API_URL || '/api/articles/check-slug',
  products: import.meta.env.VITE_PRODUCTS_API_URL || '/api/admin/products',
  productCategories: import.meta.env.VITE_PRODUCT_CATEGORIES_API_URL || '/api/admin/product-categories',
  orders: import.meta.env.VITE_ORDERS_API_URL || '/api/admin/orders',
  auth: import.meta.env.VITE_AUTH_API_URL || '/api/auth',
} as const;

export type ApiService = keyof typeof API_BASE_URLS;

// ---- Authenticated fetch helper (new) ----
// Attaches the JWT from localStorage the same way AppShell.tsx already checks it.

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return null;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Call any configured service by key + an optional subpath/querystring.
// Signature is (service, path, body) everywhere for consistency.
export const api = {
  get: (service: ApiService, path = '') => request(`${API_BASE_URLS[service]}${path}`),

  post: (service: ApiService, path = '', body?: unknown) =>
    request(`${API_BASE_URLS[service]}${path}`, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),

 put: (service: ApiService, path = '', body?: unknown) =>
    request(`${API_BASE_URLS[service]}${path}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),

    patch: (service: ApiService, path = '', body?: unknown) =>
    request(`${API_BASE_URLS[service]}${path}`, {
      method: 'PATCH',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  

  del: (service: ApiService, path = '') => request(`${API_BASE_URLS[service]}${path}`, { method: 'DELETE' }),
};