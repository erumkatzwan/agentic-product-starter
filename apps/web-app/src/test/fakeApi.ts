import { vi } from 'vitest';
import { ApiError } from '../api/client';
import type { Api, Profile } from '../api/endpoints';

export const profile: Profile = {
  id: '1',
  email: 'ada@example.com',
  displayName: 'Ada',
  role: 'Customer',
  createdAt: '2026-01-01T00:00:00Z',
};

/** An Api whose every call is a mock, with sensible happy-path defaults. */
export function fakeApi(overrides: Partial<Api> = {}): Api {
  return {
    signUp: vi.fn().mockResolvedValue({ accessToken: 'token', expiresIn: 3600 }),
    signIn: vi.fn().mockResolvedValue({ accessToken: 'token', expiresIn: 3600 }),
    signOut: vi.fn().mockResolvedValue(undefined),
    profile: vi.fn().mockResolvedValue(profile),
    updateProfile: vi.fn().mockImplementation((_t: string, displayName: string) => Promise.resolve({ ...profile, displayName })),
    deleteAccount: vi.fn().mockResolvedValue(undefined),
    items: vi.fn().mockResolvedValue([{ id: '1', title: 'First item', subtitle: 'Sub' }]),
    featureFlags: vi.fn().mockResolvedValue({ flags: {} }),
    ...overrides,
  };
}

export const invalid = (fieldErrors: Record<string, string>) => new ApiError(400, 'Invalid', fieldErrors);
