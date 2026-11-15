import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { accessibilityViolations } from './test/axe';
import { fakeApi } from './test/fakeApi';

// Every screen meets WCAG 2.2 AA (ADR-0011). Add new screens here.
const screens: [string, string, boolean, string][] = [
  ['sign in', '/signin', false, 'Sign in'],
  ['sign up', '/signup', false, 'Create an account'],
  ['home', '/', true, 'Hi, Ada'],
  ['profile', '/profile', true, 'Profile'],
];

describe('accessibility', () => {
  it.each(screens)('the %s screen has no WCAG 2.2 AA violations', async (_name, path, signedIn, heading) => {
    if (signedIn) localStorage.setItem('agentic.token', 'token');
    window.history.pushState({}, '', path);
    render(<App api={fakeApi()} />);
    await screen.findByRole('heading', { name: heading, level: 1 });

    expect(await accessibilityViolations()).toEqual([]);
  });
});
