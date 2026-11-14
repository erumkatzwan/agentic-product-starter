import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Api, Profile } from '../api/endpoints';
import { tokenStore } from './tokenStore';

interface AuthState {
  status: 'loading' | 'signedIn' | 'signedOut';
  user: Profile | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Session state for the whole app: who is signed in, and the actions that change it. */
export function AuthProvider({ api, children }: { api: Api; children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get());
  const [user, setUser] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthState['status']>(token ? 'loading' : 'signedOut');

  const startSession = useCallback(
    async (accessToken: string) => {
      const profile = await api.profile(accessToken);
      tokenStore.set(accessToken);
      setToken(accessToken);
      setUser(profile);
      setStatus('signedIn');
    },
    [api],
  );

  const endSession = useCallback(() => {
    tokenStore.set(null);
    setToken(null);
    setUser(null);
    setStatus('signedOut');
  }, []);

  // Restore the session from a stored token on page load.
  useEffect(() => {
    if (!token || user) return;
    let active = true;
    api
      .profile(token)
      .then((profile) => {
        if (!active) return;
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
      signIn: async (email, password) => startSession((await api.signIn(email, password)).accessToken),
      signUp: async (email, password, displayName) =>
        startSession((await api.signUp(email, password, displayName)).accessToken),
      signOut: async () => {
        if (token) await api.signOut(token).catch(() => undefined);
        endSession();
      },
      updateProfile: async (displayName) => {
        if (!token) return;
        setUser(await api.updateProfile(token, displayName));
      },
      deleteAccount: async () => {
        if (!token) return;
        await api.deleteAccount(token);
        endSession();
      },
    }),
    [api, status, user, token, startSession, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
