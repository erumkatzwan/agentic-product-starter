import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Api, Customer } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Button, Page, TextField } from '../../ui/ui';

export function CustomersPage({ api }: { api: Api }) {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    api
      .customers(token, query)
      .then((result) => {
        if (active) {
          setCustomers(result);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [api, token, query]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setQuery(search.trim());
  }

  return (
    <Page title="Customers">
      <form className="ds-form" onSubmit={submit} role="search">
        <TextField label="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div>
          <Button type="submit" kind="secondary">
            Search
          </Button>
        </div>
      </form>
      {error ? <Alert>Could not load customers. Please try again.</Alert> : null}
      {customers === null && !error ? <p className="ds-muted">Loading…</p> : null}
      {customers?.length === 0 ? <p className="ds-muted">No customers found.</p> : null}
      {customers && customers.length > 0 ? (
        <table className="ds-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/customers/${c.id}`}>{c.displayName}</Link>
                </td>
                <td>{c.email}</td>
                <td>{c.role}</td>
                <td>
                  {c.isDisabled ? <span className="ds-badge ds-badge--warning">Disabled</span> : <span className="ds-badge">Active</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Page>
  );
}
