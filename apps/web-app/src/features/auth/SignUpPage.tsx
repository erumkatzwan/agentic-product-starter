import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Button, Card, Page, TextField } from '../../ui/ui';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const update = (field: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      await signUp(form.email, form.password, form.displayName);
      navigate('/');
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fieldErrors).length > 0) setFieldErrors(e.fieldErrors);
      else setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page title="Create an account">
      <div className="ds-auth">
        <Card>
          <form className="ds-form" onSubmit={submit} noValidate>
            {error ? <Alert>{error}</Alert> : null}
            <TextField
              label="Name"
              autoComplete="name"
              value={form.displayName}
              onChange={(e) => update('displayName')(e.target.value)}
              error={fieldErrors.displayName}
            />
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email')(e.target.value)}
              error={fieldErrors.email}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password')(e.target.value)}
              error={fieldErrors.password}
            />
            <Button type="submit" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>
        <p className="ds-muted">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </Page>
  );
}
