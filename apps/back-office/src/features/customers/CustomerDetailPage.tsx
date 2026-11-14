import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';
import type { Api, Customer, Role } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Button, Card, Page, TextField } from '../../ui/ui';

export function CustomerDetailPage({ api }: { api: Api }) {
  const { id = '' } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<{ displayName: string; role: Role; isDisabled: boolean }>({
    displayName: '',
    role: 'Customer',
    isDisabled: false,
  });
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  useEffect(() => {
    if (!token) return;
    api
      .customer(token, id)
      .then((c) => {
        setCustomer(c);
        setForm({ displayName: c.displayName, role: c.role, isDisabled: c.isDisabled });
      })
      .catch(() => setMessage({ kind: 'error', text: 'Customer not found.' }));
  }, [api, token, id]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setMessage(null);
    setFieldError(undefined);
    try {
      setCustomer(await api.updateCustomer(token, id, form));
      setMessage({ kind: 'success', text: 'Customer saved.' });
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors.displayName) setFieldError(e.fieldErrors.displayName);
      else setMessage({ kind: 'error', text: e instanceof ApiError ? e.message : 'Could not save. Please try again.' });
    }
  }

  async function remove() {
    if (!token || !customer) return;
    if (!window.confirm(`Delete ${customer.email}? This cannot be undone.`)) return;
    try {
      await api.deleteCustomer(token, id);
      navigate('/');
    } catch (e) {
      setMessage({ kind: 'error', text: e instanceof ApiError ? e.message : 'Could not delete. Please try again.' });
    }
  }

  return (
    <Page title={customer?.displayName ?? 'Customer'} actions={<Link to="/">Back to customers</Link>}>
      {message ? <Alert kind={message.kind}>{message.text}</Alert> : null}
      {customer ? (
        <>
          <Card>
            <form className="ds-form" onSubmit={save} noValidate>
              <TextField label="Email" value={customer.email} readOnly />
              <TextField
                label="Name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                error={fieldError}
              />
              <div className="ds-field">
                <label htmlFor="role">Role</label>
                <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <label className="ds-toggle">
                <span>Disable account (blocks sign in)</span>
                <input
                  type="checkbox"
                  checked={form.isDisabled}
                  onChange={(e) => setForm({ ...form, isDisabled: e.target.checked })}
                />
              </label>
              <div>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Card>
          <Card>
            <h2>Delete customer</h2>
            <p className="ds-muted">Removes the account and its data. This cannot be undone.</p>
            <Button kind="danger" onClick={remove}>
              Delete customer
            </Button>
          </Card>
        </>
      ) : null}
    </Page>
  );
}
