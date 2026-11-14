import type { ReactNode } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import type { Api } from './api/endpoints';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { SignInPage } from './features/auth/SignInPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { HomePage } from './features/home/HomePage';
import { ProfilePage } from './features/profile/ProfilePage';
import { FeatureFlagsProvider, FeatureGate, useFeatureFlag } from './featureFlags/FeatureFlags';

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') return <p className="ds-page ds-muted">Loading…</p>;
  return status === 'signedIn' ? <>{children}</> : <Navigate to="/signin" replace />;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  return status === 'signedIn' ? <Navigate to="/" replace /> : <>{children}</>;
}

function Nav() {
  const { status } = useAuth();
  return (
    <nav className="ds-nav" aria-label="Main">
      <Link to="/" className="ds-nav__brand">
        Agentic App
      </Link>
      {status === 'signedIn' ? (
        <div className="ds-nav__links">
          <Link to="/">Home</Link>
          <FeatureGate flag="profile">
            <Link to="/profile">Profile</Link>
          </FeatureGate>
        </div>
      ) : null}
    </nav>
  );
}

function AppRoutes({ api }: { api: Api }) {
  const signUpEnabled = useFeatureFlag('sign_up');
  const profileEnabled = useFeatureFlag('profile');
  return (
    <Routes>
      <Route path="/signin" element={<GuestOnly><SignInPage /></GuestOnly>} />
      {signUpEnabled ? <Route path="/signup" element={<GuestOnly><SignUpPage /></GuestOnly>} /> : null}
      <Route path="/" element={<RequireAuth><HomePage api={api} /></RequireAuth>} />
      {profileEnabled ? <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} /> : null}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App({ api }: { api: Api }) {
  return (
    <FeatureFlagsProvider api={api}>
      <AuthProvider api={api}>
        <BrowserRouter>
          <Nav />
          <AppRoutes api={api} />
        </BrowserRouter>
      </AuthProvider>
    </FeatureFlagsProvider>
  );
}
