import type {
  Media,
  MediaDetail,
  MediaListParams,
  MediaListResponse,
  MediaMetadataInput,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchMedia(params: MediaListParams): Promise<MediaListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.range) query.set('range', params.range);
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 4));

  const res = await fetch(`${API_BASE}/api/media?${query.toString()}`, {
    headers: { ...authHeaders() },
  });
  return handle<MediaListResponse>(res);
}

export async function fetchMediaDetail(id: number): Promise<MediaDetail> {
  const res = await fetch(`${API_BASE}/api/media/${id}`, { headers: { ...authHeaders() } });
  return handle<MediaDetail>(res);
}

export async function uploadMedia(files: File[]): Promise<{ items: Media[] }> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await fetch(`${API_BASE}/api/media/upload`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
  });
  return handle<{ items: Media[] }>(res);
}

export async function updateMediaMetadata(
  id: number,
  input: MediaMetadataInput
): Promise<Media> {
  const res = await fetch(`${API_BASE}/api/media/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  });
  return handle<Media>(res);
}

export async function deleteMedia(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/media/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  return handle<void>(res);
}

export async function deleteMediaBulk(ids: number[]): Promise<{ deleted: number }> {
  const res = await fetch(`${API_BASE}/api/media/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ ids }),
  });
  return handle<{ deleted: number }>(res);
}