import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, request } from './client';

const respond = (status: number, body?: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );

describe('request', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sends JSON with the bearer token and returns the body', async () => {
    const fetchMock = respond(200, { ok: true });

    const result = await request<{ ok: boolean }>('http://api', '/x', { method: 'POST', body: { a: 1 }, token: 't' });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('http://api/x');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"a":1}');
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer t');
  });

  it('returns undefined for 204', async () => {
    respond(204);
    await expect(request('http://api', '/x')).resolves.toBeUndefined();
  });

  it('turns validation problems into field errors', async () => {
    respond(400, { title: 'Invalid', errors: { email: ['Enter a valid email address.'] } });

    const error = await request('http://api', '/x').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).fieldErrors).toEqual({ email: 'Enter a valid email address.' });
  });

  it('uses the problem detail as message', async () => {
    respond(409, { title: 'Conflict', detail: 'An account with this email already exists.' });
    await expect(request('http://api', '/x')).rejects.toThrow('An account with this email already exists.');
  });

  it('reports network failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('offline'));
    await expect(request('http://api', '/x')).rejects.toMatchObject({ status: 0 });
  });
});
