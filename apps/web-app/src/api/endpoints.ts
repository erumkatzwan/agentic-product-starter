import { env } from '../config/env';
import { request } from './client';

export interface Token {
  accessToken: string;
  expiresIn: number;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: 'Customer' | 'Admin';
  createdAt: string;
}

export interface Item {
  id: string;
  title: string;
  subtitle: string;
}

export interface FeatureFlags {
  flags: Record<string, boolean>;
}

const call = <T>(path: string, options?: Parameters<typeof request>[2]) => request<T>(env.apiBaseUrl, path, options);

/** All backend endpoints the web app uses. Add new ones here. */
export const api = {
  signUp: (email: string, password: string, displayName: string) =>
    call<Token>('/api/auth/signup', { method: 'POST', body: { email, password, displayName } }),
  signIn: (email: string, password: string) => call<Token>('/api/auth/signin', { method: 'POST', body: { email, password } }),
  signOut: (token: string) => call<undefined>('/api/auth/signout', { method: 'POST', token }),
  profile: (token: string) => call<Profile>('/api/me', { token }),
  updateProfile: (token: string, displayName: string) => call<Profile>('/api/me', { method: 'PUT', token, body: { displayName } }),
  deleteAccount: (token: string) => call<undefined>('/api/me', { method: 'DELETE', token }),
  items: () => call<Item[]>('/api/items'),
  featureFlags: () => call<FeatureFlags>('/api/feature-flags'),
};

export type Api = typeof api;
