import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './api/client';
import { App } from './App';
import { customer, fakeApi, invalid } from './test/fakeApi';

const renderApp = (api = fakeApi(), path = '/', signedIn = true) => {
  if (signedIn) localStorage.setItem('agentic.admin.token', 'token');
  window.history.pushState({}, '', path);
  render(<App api={api} />);
  return api;
};

describe('Back office', () => {
  it('lets an admin sign in and see customers', async () => {
    const api = renderApp(fakeApi(), '/', false);
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'Admin123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('link', { name: 'Demo Customer' })).toBeInTheDocument();
    expect(api.customers).toHaveBeenCalledWith('token', '');
  });

  it('rejects customers who try to sign in', async () => {
    const api = fakeApi({ profile: vi.fn().mockResolvedValue({ ...customer, role: 'Customer' }) });
    renderApp(api, '/', false);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This account is not an administrator.');
    expect(api.signOut).toHaveBeenCalledWith('token');
  });

  it('shows sign in errors', async () => {
    renderApp(fakeApi({ signIn: vi.fn().mockRejectedValue(new ApiError(401, 'Email or password is incorrect.')) }), '/', false);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
  });

  it('searches customers', async () => {
    const api = renderApp();
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('Search by name or email'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(api.customers).toHaveBeenLastCalledWith('token', 'demo');
  });

  it('shows empty and error states', async () => {
    renderApp(fakeApi({ customers: vi.fn().mockResolvedValue([]) }));
    expect(await screen.findByText('No customers found.')).toBeInTheDocument();
  });

  it('shows an error when customers cannot load', async () => {
    renderApp(fakeApi({ customers: vi.fn().mockRejectedValue(new Error('down')) }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load customers');
  });

  it('edits a customer', async () => {
    const api = renderApp(fakeApi(), '/customers/c1');
    const user = userEvent.setup();

    const name = await screen.findByLabelText('Name');
    await user.clear(name);
    await user.type(name, 'Support Edited');
    await user.click(screen.getByLabelText('Disable account (blocks sign in)'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Customer saved.')).toBeInTheDocument();
    expect(api.updateCustomer).toHaveBeenCalledWith('token', 'c1', { displayName: 'Support Edited', role: 'Customer', isDisabled: true });
  });

  it('shows validation and server errors when saving', async () => {
    const updateCustomer = vi
      .fn()
      .mockRejectedValueOnce(invalid({ displayName: 'Enter your name.' }))
      .mockRejectedValueOnce(new ApiError(400, 'You cannot disable yourself or remove your own admin role.'));
    renderApp(fakeApi({ updateCustomer }), '/customers/c1');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Enter your name.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('You cannot disable yourself');
  });

  it('deletes a customer after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const api = renderApp(fakeApi(), '/customers/c1');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Delete customer' }));

    expect(api.deleteCustomer).toHaveBeenCalledWith('token', 'c1');
    expect(await screen.findByRole('heading', { name: 'Customers' })).toBeInTheDocument();
  });

  it('shows not found for an unknown customer', async () => {
    renderApp(fakeApi({ customer: vi.fn().mockRejectedValue(new ApiError(404, 'Not found')) }), '/customers/x');
    expect(await screen.findByText('Customer not found.')).toBeInTheDocument();
  });

  it('toggles a feature flag', async () => {
    const api = renderApp(fakeApi(), '/feature-flags');
    const user = userEvent.setup();

    const toggle = await screen.findByRole('checkbox', { name: 'profile' });
    expect(toggle).toBeChecked();
    await user.click(toggle);

    expect(api.setFeatureFlag).toHaveBeenCalledWith('token', 'profile', false);
    expect(await screen.findByRole('checkbox', { name: 'profile' })).not.toBeChecked();
  });

  it('reports a failed flag update', async () => {
    renderApp(fakeApi({ setFeatureFlag: vi.fn().mockRejectedValue(new Error('down')) }), '/feature-flags');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('checkbox', { name: 'profile' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not update profile.');
  });

  it('signs out', async () => {
    const api = renderApp();
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('heading', { name: 'Back office sign in' })).toBeInTheDocument();
    expect(api.signOut).toHaveBeenCalledWith('token');
  });

  it('drops a stored token that belongs to a customer', async () => {
    renderApp(fakeApi({ profile: vi.fn().mockResolvedValue({ ...customer, role: 'Customer' }) }));
    expect(await screen.findByRole('heading', { name: 'Back office sign in' })).toBeInTheDocument();
    expect(localStorage.getItem('agentic.admin.token')).toBeNull();
  });
});
