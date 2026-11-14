import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../api/client';
import type { Api, Profile } from '../api/endpoints';
import { tokenStore } from './tokenStore';

interface AuthState {
  status: 'loading' | 'signedIn' | 'signedOut';
  user: Profile | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const notAdminMessage = 'This account is not an administrator.';

/** Admin session. Only users with the Admin role can sign in to the back office. */
export function AuthProvider({ api, children }: { api: Api; children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get());
  const [user, setUser] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthState['status']>(token ? 'loading' : 'signedOut');

  const endSession = useCallback(() => {
    tokenStore.set(null);
    setToken(null);
    setUser(null);
    setStatus('signedOut');
  }, []);

  useEffect(() => {
    if (!token || user) return;
    let active = true;
    api
      .profile(token)
      .then((profile) => {
        if (!active) return;
        if (profile.role !== 'Admin') return endSession();
        setUser(profile);
        setStatus('signedIn');
      })
      .catch(() => {
        if (active) endSession();
      });
    return () => {
      active = false;
    };
  }, [api, token, user, endSession]);

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      token,
      signIn: async (email, password) => {
        const { accessToken } = await api.signIn(email, password);
        const profile = await api.profile(accessToken);
        if (profile.role !== 'Admin') {
          await api.signOut(accessToken).catch(() => undefined);
          throw new ApiError(403, notAdminMessage);
        }
        tokenStore.set(accessToken);
        setToken(accessToken);
        setUser(profile);
        setStatus('signedIn');
      },
      signOut: async () => {
        if (token) await api.signOut(token).catch(() => undefined);
        endSession();
      },
    }),
    [api, status, user, token, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
