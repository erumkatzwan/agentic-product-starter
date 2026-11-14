import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './api/client';
import { App } from './App';
import { fakeApi, invalid } from './test/fakeApi';

const renderApp = (api = fakeApi(), path = '/') => {
  window.history.pushState({}, '', path);
  render(<App api={api} />);
  return api;
};

describe('App', () => {
  it('sends signed-out visitors to sign in', async () => {
    renderApp();
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('signs in and shows the home page with items', async () => {
    const api = renderApp();
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password1!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Hi, Ada' })).toBeInTheDocument();
    expect(await screen.findByText('First item')).toBeInTheDocument();
    expect(api.signIn).toHaveBeenCalledWith('ada@example.com', 'Password1!');
    expect(localStorage.getItem('agentic.token')).toBe('token');
  });

  it('shows the error message when sign in fails', async () => {
    renderApp(fakeApi({ signIn: vi.fn().mockRejectedValue(new ApiError(401, 'Email or password is incorrect.')) }));
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
  });

  it('signs up and shows field errors from the backend', async () => {
    const signUp = vi
      .fn()
      .mockRejectedValueOnce(invalid({ email: 'Enter a valid email address.' }))
      .mockResolvedValue({ accessToken: 'token', expiresIn: 3600 });
    renderApp(fakeApi({ signUp }), '/signup');
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Name'), 'Ada');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('heading', { name: 'Hi, Ada' })).toBeInTheDocument();
  });

  it('hides sign up when the flag is off', async () => {
    renderApp(fakeApi({ featureFlags: vi.fn().mockResolvedValue({ flags: { sign_up: false } }) }));

    await screen.findByRole('heading', { name: 'Sign in' });
    await waitFor(() => expect(screen.queryByText('Create an account')).not.toBeInTheDocument());
  });

  it('restores a stored session, edits the profile and signs out', async () => {
    localStorage.setItem('agentic.token', 'token');
    const api = renderApp(fakeApi(), '/profile');
    const user = userEvent.setup();

    const name = await screen.findByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Ada Lovelace');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
    expect(api.updateProfile).toHaveBeenCalledWith('token', 'Ada Lovelace');

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(api.signOut).toHaveBeenCalledWith('token');
    expect(localStorage.getItem('agentic.token')).toBeNull();
  });

  it('shows a profile field error', async () => {
    localStorage.setItem('agentic.token', 'token');
    renderApp(fakeApi({ updateProfile: vi.fn().mockRejectedValue(invalid({ displayName: 'Enter your name.' })) }), '/profile');
    const user = userEvent.setup();

    await user.clear(await screen.findByLabelText('Name'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Enter your name.')).toBeInTheDocument();
  });

  it('deletes the account after confirmation', async () => {
    localStorage.setItem('agentic.token', 'token');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const api = renderApp(fakeApi(), '/profile');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Delete account' }));

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(api.deleteAccount).toHaveBeenCalledWith('token');
  });

  it('drops an expired stored token', async () => {
    localStorage.setItem('agentic.token', 'expired');
    renderApp(fakeApi({ profile: vi.fn().mockRejectedValue(new ApiError(401, 'Unauthorized')) }));

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(localStorage.getItem('agentic.token')).toBeNull();
  });

  it('shows an error when items cannot load', async () => {
    localStorage.setItem('agentic.token', 'token');
    renderApp(fakeApi({ items: vi.fn().mockRejectedValue(new Error('down')) }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load content');
  });
});
