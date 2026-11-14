import { env } from '../config/env';
import { request } from './client';

export interface Token {
  accessToken: string;
  expiresIn: number;
}

export type Role = 'Customer' | 'Admin';

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  isDisabled: boolean;
  createdAt: string;
}

export interface CustomerUpdate {
  displayName: string;
  role: Role;
  isDisabled: boolean;
}

export interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
}

const call = <T>(path: string, options?: Parameters<typeof request>[2]) => request<T>(env.apiBaseUrl, path, options);

/** All backend endpoints the back office uses. Admin endpoints need an admin token. */
export const api = {
  signIn: (email: string, password: string) => call<Token>('/api/auth/signin', { method: 'POST', body: { email, password } }),
  signOut: (token: string) => call<undefined>('/api/auth/signout', { method: 'POST', token }),
  profile: (token: string) => call<Profile>('/api/me', { token }),
  customers: (token: string, search = '') =>
    call<Customer[]>(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`, { token }),
  customer: (token: string, id: string) => call<Customer>(`/api/admin/users/${id}`, { token }),
  updateCustomer: (token: string, id: string, update: CustomerUpdate) =>
    call<Customer>(`/api/admin/users/${id}`, { method: 'PUT', token, body: update }),
  deleteCustomer: (token: string, id: string) => call<undefined>(`/api/admin/users/${id}`, { method: 'DELETE', token }),
  featureFlags: (token: string) => call<FeatureFlag[]>('/api/admin/feature-flags', { token }),
  setFeatureFlag: (token: string, key: string, enabled: boolean) =>
    call<FeatureFlag>(`/api/admin/feature-flags/${key}`, { method: 'PUT', token, body: { enabled } }),
};

export type Api = typeof api;
