const KEY = 'agentic.admin.token';

/** Keeps the access token between page loads. Wrapped because storage can be unavailable. */
export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null): void {
    try {
      if (token) localStorage.setItem(KEY, token);
      else localStorage.removeItem(KEY);
    } catch {
      // Storage unavailable: the session lasts for this page only.
    }
  },
};
