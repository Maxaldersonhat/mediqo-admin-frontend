import { API_BASE_URLS } from '../lib/api';
import type { Stats } from '../types';

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(API_BASE_URLS.stats);
  if (!res.ok) {
    throw new Error('Failed to fetch stats');
  }
  return res.json();
}