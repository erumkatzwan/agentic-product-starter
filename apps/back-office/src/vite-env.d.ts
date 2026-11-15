/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string;
  readonly VITE_API_BASE_URL?: string;
  /** Sentry DSN for crash reporting, from SENTRY_DSN_BACK_OFFICE (see config/integrations.json). Empty means off. */
  readonly VITE_SENTRY_DSN?: string;
}
