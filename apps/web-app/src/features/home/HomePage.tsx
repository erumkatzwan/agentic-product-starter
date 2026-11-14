import { useEffect, useState } from 'react';
import type { Api, Item } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Page } from '../../ui/ui';

export function HomePage({ api }: { api: Api }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.items().then(setItems).catch(() => setError(true));
  }, [api]);

  return (
    <Page title={`Hi, ${user?.displayName ?? ''}`}>
      {error ? <Alert>Could not load content. Please try again.</Alert> : null}
      {items === null && !error ? <p className="ds-muted">Loading…</p> : null}
      {items ? (
        <ul className="ds-list" aria-label="Items">
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <div className="ds-muted">{item.subtitle}</div>
            </li>
          ))}
        </ul>
      ) : null}
    </Page>
  );
}
