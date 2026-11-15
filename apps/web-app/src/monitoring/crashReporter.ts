/**
 * Crash and error reporting (ADR-0008). Sentry is loaded only when VITE_SENTRY_DSN is set at build time,
 * so local runs, tests and forks send nothing. Never pass personal data (emails, names, tokens).
 */
export interface CrashReporter {
  capture(error: unknown): void;
}

const noOpCrashReporter: CrashReporter = { capture: () => undefined };

let current: CrashReporter = noOpCrashReporter;

export function isCrashReportingEnabled(dsn: string | undefined): dsn is string {
  return Boolean(dsn?.trim());
}

/** Starts Sentry when a DSN is set; otherwise reporting stays off. */
export async function startCrashReporting(dsn: string | undefined, environment: string): Promise<boolean> {
  if (!isCrashReportingEnabled(dsn)) return false;
  const Sentry = await import('@sentry/react');
  // Sentry sends no personal data (IP addresses, cookies, user details) unless told to; keep it that way.
  Sentry.init({ dsn, environment, tracesSampleRate: 0.2, integrations: [Sentry.browserTracingIntegration()] });
  current = { capture: (error) => Sentry.captureException(error) };
  return true;
}

/** Reports an unexpected error. Safe to call whether or not reporting is on. */
export function reportError(error: unknown): void {
  current.capture(error);
}

/** For tests: back to the no-op reporter. */
export function resetCrashReporting(): void {
  current = noOpCrashReporter;
}
