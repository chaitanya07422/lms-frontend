import { apiRequest } from '@/lib/api';
import type { AuthPayload, PublicUser } from '@/types/user';

export function login(email: string, password: string): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: { email, password },
    token: null,
  });
}

export function register(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/register', {
    method: 'POST',
    body: { email, password, fullName },
    token: null,
  });
}

export async function fetchMe(token: string): Promise<PublicUser> {
  const data = await apiRequest<{ user: PublicUser }>('/auth/me', { token });
  return data.user;
}
