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

test('signed-out visitors can browse the catalog and title pages', async () => {
  for (const path of ['/', '/list', '/list?status=toWatch', '/movie/123', '/tv/123', '/sitemap.xml']) {
    const response = await proxy(new NextRequest(`http://localhost:3000${path}`));
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('location'), null, path);
  }
});

test('signed-in users opening sign-in continue to a safe next page', async () => {
  const origin = 'http://localhost:3000';
  const headers = { cookie: 'better-auth.session_token=test-session' };
  const cases = [
    ['/signin?next=%2Fmovie%2F123', `${origin}/movie/123`],
    ['/signin?next=https%3A%2F%2Fevil.example', `${origin}/list`],
    ['/signin?next=%2F%2Fevil.example', `${origin}/list`],
  ];

  for (const [path, location] of cases) {
    const response = await proxy(new NextRequest(`${origin}${path}`, { headers }));
    assert.equal(response.status, 307, path);
    assert.equal(response.headers.get('location'), location, path);
  }
});

test('unknown routes still redirect signed-out users to sign in', async () => {
  for (const path of ['/movie/abc', '/movie/123/extra', '/signup-private', '/api/auth-private', '/list-private']) {
    const response = await proxy(new NextRequest(`http://localhost:3000${path}`));
    assert.equal(response.status, 307, path);
    assert.equal(response.headers.get('location'), 'http://localhost:3000/signin', path);
  }
});
