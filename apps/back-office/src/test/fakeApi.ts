import { vi } from 'vitest';
import { ApiError } from '../api/client';
import type { Api, Customer, Profile } from '../api/endpoints';

export const admin: Profile = { id: 'a', email: 'admin@example.com', displayName: 'Admin', role: 'Admin', createdAt: '2026-01-01T00:00:00Z' };

export const customer: Customer = {
  id: 'c1',
  email: 'customer@example.com',
  displayName: 'Demo Customer',
  role: 'Customer',
  isDisabled: false,
  createdAt: '2026-01-01T00:00:00Z',
};

export function fakeApi(overrides: Partial<Api> = {}): Api {
  return {
    signIn: vi.fn().mockResolvedValue({ accessToken: 'token', expiresIn: 3600 }),
    signOut: vi.fn().mockResolvedValue(undefined),
    profile: vi.fn().mockResolvedValue(admin),
    customers: vi.fn().mockResolvedValue([customer]),
    customer: vi.fn().mockResolvedValue(customer),
    updateCustomer: vi.fn().mockImplementation((_t: string, _id: string, update: Partial<Customer>) =>
      Promise.resolve({ ...customer, ...update }),
    ),
    deleteCustomer: vi.fn().mockResolvedValue(undefined),
    featureFlags: vi.fn().mockResolvedValue([{ key: 'profile', description: 'Profile screen', enabled: true }]),
    setFeatureFlag: vi.fn().mockImplementation((_t: string, key: string, enabled: boolean) =>
      Promise.resolve({ key, description: 'Profile screen', enabled }),
    ),
    ...overrides,
  };
}

export const invalid = (fieldErrors: Record<string, string>) => new ApiError(400, 'Invalid', fieldErrors);
