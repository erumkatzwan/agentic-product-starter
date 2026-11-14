import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { FeatureGate } from '../../featureFlags/FeatureFlags';
import { Alert, Button, Card, Page, TextField } from '../../ui/ui';

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page title="Sign in">
      <div className="ds-auth">
        <Card>
          <form className="ds-form" onSubmit={submit} noValidate>
            {error ? <Alert>{error}</Alert> : null}
            <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
            <FeatureGate flag="google_sign_in">
              <Button type="button" kind="secondary" disabled title="Coming soon">
                Sign in with Google
              </Button>
            </FeatureGate>
          </form>
        </Card>
        <FeatureGate flag="sign_up">
          <p className="ds-muted">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </FeatureGate>
      </div>
    </Page>
  );
}
