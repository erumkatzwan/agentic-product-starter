import type { ReactNode } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import type { Api } from './api/endpoints';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SignInPage } from './features/auth/SignInPage';
import { CustomerDetailPage } from './features/customers/CustomerDetailPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { FeatureFlagsPage } from './features/flags/FeatureFlagsPage';
import { Button } from './ui/ui';

function RequireAdmin({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') return <p className="ds-page ds-muted">Loading…</p>;
  return status === 'signedIn' ? <>{children}</> : <Navigate to="/signin" replace />;
}

function Nav() {
  const { status, user, signOut } = useAuth();
  return (
    <nav className="ds-nav" aria-label="Main">
      <Link to="/" className="ds-nav__brand">
        Agentic Back Office
      </Link>
      {status === 'signedIn' ? (
        <div className="ds-nav__links">
          <Link to="/">Customers</Link>
          <Link to="/feature-flags">Feature flags</Link>
          <span className="ds-muted">{user?.email}</span>
          <Button kind="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      ) : null}
    </nav>
  );
}

export function App({ api }: { api: Api }) {
  return (
    <AuthProvider api={api}>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/" element={<RequireAdmin><CustomersPage api={api} /></RequireAdmin>} />
          <Route path="/customers/:id" element={<RequireAdmin><CustomerDetailPage api={api} /></RequireAdmin>} />
          <Route path="/feature-flags" element={<RequireAdmin><FeatureFlagsPage api={api} /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
