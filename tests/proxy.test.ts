import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

test('HTTPS sessions can browse protected routes and redirect away from sign-in', async () => {
  const origin = 'https://q-watcher.next-nexus.dev';
  const headers = { cookie: '__Secure-better-auth.session_token=test-session' };
  const listResponse = await proxy(new NextRequest(`${origin}/list`, { headers }));
  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.headers.get('location'), null);

  const signInResponse = await proxy(new NextRequest(`${origin}/signin`, { headers }));
  assert.equal(signInResponse.status, 307);
  assert.equal(signInResponse.headers.get('location'), `${origin}/list`);
});

test('signed-out users can access email recovery and verification routes', async () => {
  for (const path of [
    '/signin', '/login', '/signup', '/forgot-password',
    '/reset-password?token=test-token', '/verify-email',
    '/api/auth/request-password-reset', '/api/auth/verify-email?token=test-token',
  ]) {
    const response = await proxy(new NextRequest(`http://localhost:3000${path}`));
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('location'), null, path);
  }
});

test('protected routes still redirect signed-out users to sign in', async () => {
  for (const path of ['/movie/123', '/tv/123', '/signup-private', '/api/auth-private']) {
    const response = await proxy(new NextRequest(`http://localhost:3000${path}`));
    assert.equal(response.status, 307, path);
    assert.equal(response.headers.get('location'), 'http://localhost:3000/signin', path);
  }
});
