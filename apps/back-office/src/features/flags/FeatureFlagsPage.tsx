import { useEffect, useState } from 'react';
import type { Api, FeatureFlag } from '../../api/endpoints';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Card, Page } from '../../ui/ui';

/** Switch features on or off for every app: iOS, web app and future apps read the same flags. */
export function FeatureFlagsPage({ api }: { api: Api }) {
  const { token } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .featureFlags(token)
      .then(setFlags)
      .catch(() => setError('Could not load feature flags.'));
  }, [api, token]);

  async function toggle(flag: FeatureFlag) {
    if (!token) return;
    setError(null);
    try {
      const updated = await api.setFeatureFlag(token, flag.key, !flag.enabled);
      setFlags((current) => current?.map((f) => (f.key === updated.key ? updated : f)) ?? null);
    } catch {
      setError(`Could not update ${flag.key}.`);
    }
  }

  return (
    <Page title="Feature flags">
      <p className="ds-muted">Changes apply to every app the next time it loads its flags.</p>
      {error ? <Alert>{error}</Alert> : null}
      {flags ? (
        <Card>
          {flags.map((flag) => (
            <label key={flag.key} className="ds-toggle">
              <span>
                <strong>{flag.key}</strong>
                <span className="ds-muted"> — {flag.description}</span>
              </span>
              <input type="checkbox" checked={flag.enabled} onChange={() => toggle(flag)} aria-label={flag.key} />
            </label>
          ))}
        </Card>
      ) : null}
    </Page>
  );
}
