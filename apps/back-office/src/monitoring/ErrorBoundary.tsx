import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from './crashReporter';

type State = { failed: boolean };

/** Catches render errors anywhere below it, reports them, and shows a calm message instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(Object.assign(error, { componentStack: info.componentStack }));
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="ds-page">
        <div role="alert" className="ds-alert ds-alert--error">
          <p>Something went wrong. We have been told about it.</p>
          <button type="button" className="ds-button ds-button--secondary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </main>
    );
  }
}
