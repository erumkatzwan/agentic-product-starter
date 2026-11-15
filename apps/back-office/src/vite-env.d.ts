/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string;
  readonly VITE_API_BASE_URL?: string;
  /** Sentry DSN for crash reporting. Unset means off. */
  readonly VITE_SENTRY_DSN?: string;
}
