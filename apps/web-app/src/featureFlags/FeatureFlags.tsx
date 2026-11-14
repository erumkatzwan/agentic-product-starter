import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Api } from '../api/endpoints';

/** Defaults used until the backend answers, or when it cannot be reached. Keys match every app. */
export const defaultFlags: Record<string, boolean> = {
  settings: true,
  item_detail: true,
  profile: true,
  sign_up: true,
  push_prompt: false,
  google_sign_in: false,
};

const FlagsContext = createContext<Record<string, boolean>>(defaultFlags);

export function FeatureFlagsProvider({ api, children }: { api: Api; children: ReactNode }) {
  const [flags, setFlags] = useState(defaultFlags);

  useEffect(() => {
    api
      .featureFlags()
      .then((remote) => setFlags({ ...defaultFlags, ...remote.flags }))
      .catch(() => undefined);
  }, [api]);

  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
}

export function useFeatureFlag(key: string): boolean {
  return useContext(FlagsContext)[key] ?? false;
}

/** Renders its children only when the flag is on: `<FeatureGate flag="profile">…</FeatureGate>`. */
export function FeatureGate({ flag, children }: { flag: string; children: ReactNode }) {
  return useFeatureFlag(flag) ? <>{children}</> : null;
}
