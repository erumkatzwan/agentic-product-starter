import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Button, Card, Page, TextField } from '../../ui/ui';

export function ProfilePage() {
  const { user, updateProfile, deleteAccount, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setFieldError(undefined);
    try {
      await updateProfile(displayName);
      setMessage({ kind: 'success', text: 'Profile saved.' });
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.displayName) setFieldError(e.fieldErrors.displayName);
      else setMessage({ kind: 'error', text: 'Could not save. Please try again.' });
    }
  }

  async function remove() {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    await deleteAccount();
    navigate('/signin');
  }

  async function leave() {
    await signOut();
    navigate('/signin');
  }

  return (
    <Page title="Profile" actions={<Button kind="secondary" onClick={leave}>Sign out</Button>}>
      <Card>
        <form className="ds-form" onSubmit={save} noValidate>
          {message ? <Alert kind={message.kind}>{message.text}</Alert> : null}
          <TextField label="Email" value={user?.email ?? ''} readOnly />
          <TextField label="Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={fieldError} />
          <Button type="submit">Save</Button>
        </form>
      </Card>
      <Card>
        <h2>Delete account</h2>
        <p className="ds-muted">Removes your account and data. This cannot be undone.</p>
        <Button kind="danger" onClick={remove}>
          Delete account
        </Button>
      </Card>
    </Page>
  );
}
