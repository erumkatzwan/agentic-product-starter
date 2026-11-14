import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

/** Design-system components. Style only with tokens (see styles/tokens.css); never hard-code colours. */

type ButtonKind = 'primary' | 'secondary' | 'danger';

export function Button({ kind = 'primary', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: ButtonKind }) {
  return <button className={['ds-button', `ds-button--${kind}`, className].filter(Boolean).join(' ')} {...props} />;
}

export function TextField({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="ds-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...props} />
      {error ? (
        <p id={errorId} className="ds-field__error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="ds-card">{children}</section>;
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'success'; children: ReactNode }) {
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`ds-alert ds-alert--${kind}`}>
      {children}
    </div>
  );
}

export function Page({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <main className="ds-page">
      <header className="ds-page__header">
        <h1>{title}</h1>
        {actions ? <div className="ds-page__actions">{actions}</div> : null}
      </header>
      {children}
    </main>
  );
}
