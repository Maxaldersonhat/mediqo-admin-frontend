import { api } from '../lib/api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl: string | null;
}

export async function fetchMe(): Promise<{ user: AuthUser }> {
  return api.get('auth', '/me');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  return api.patch('auth', '/password', { currentPassword, newPassword });
}

export async function uploadAvatar(file: File): Promise<{ success: boolean }> {
  const fd = new FormData();
  fd.append('avatar', file);
  return api.patch('auth', '/avatar', fd);
}