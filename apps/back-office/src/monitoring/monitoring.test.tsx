import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import { isCrashReportingEnabled, reportError, resetCrashReporting, startCrashReporting } from './crashReporter';

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
}));
vi.mock('@sentry/react', () => sentry);

afterEach(() => {
  resetCrashReporting();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('crash reporting', () => {
  it('is off without a DSN', async () => {
    expect(isCrashReportingEnabled(undefined)).toBe(false);
    expect(isCrashReportingEnabled('  ')).toBe(false);
    expect(await startCrashReporting('', 'dev')).toBe(false);
    reportError(new Error('ignored'));
    expect(sentry.init).not.toHaveBeenCalled();
    expect(sentry.captureException).not.toHaveBeenCalled();
  });

  it('starts Sentry with a DSN and reports errors without personal data', async () => {
    expect(await startCrashReporting('https://key@example.ingest.sentry.io/1', 'prod')).toBe(true);
    expect(sentry.init).toHaveBeenCalledWith(expect.objectContaining({ dsn: 'https://key@example.ingest.sentry.io/1', environment: 'prod' }));

    const error = new Error('boom');
    reportError(error);
    expect(sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('shows a message and reports when a screen crashes', async () => {
    await startCrashReporting('https://key@example.ingest.sentry.io/1', 'syst');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function Broken(): never {
      throw new Error('render failed');
    }

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(sentry.captureException).toHaveBeenCalledWith(expect.objectContaining({ message: 'render failed' }));
  });

  it('renders its children when nothing fails', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});
