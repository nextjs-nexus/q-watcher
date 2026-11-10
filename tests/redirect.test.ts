import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getSafeRedirectPath, getSignInHref } from '../lib/redirect';

test('post-login redirects keep same-site pages and their query strings', () => {
  assert.equal(getSafeRedirectPath('/movie/123'), '/movie/123');
  assert.equal(getSafeRedirectPath('/list?status=toWatch&type=2'), '/list?status=toWatch&type=2');
  assert.equal(getSafeRedirectPath('/tv/1396?returnTo=%2Flist%3Ftype%3D2'), '/tv/1396?returnTo=%2Flist%3Ftype%3D2');
});

test('post-login redirects reject other sites and authentication pages', () => {
  for (const value of [
    undefined,
    null,
    '',
    'movie/123',
    'https://evil.example/list',
    '//evil.example/list',
    '/\\evil.example',
    '/signin',
    '/signup?next=/list',
    '/api/auth/sign-out',
  ]) {
    assert.equal(getSafeRedirectPath(value), '/list', String(value));
  }
});

test('sign-in links carry the current page only when it is useful', () => {
  assert.equal(getSignInHref('/movie/123'), '/signin?next=%2Fmovie%2F123');
  assert.equal(getSignInHref('/list'), '/signin');
  assert.equal(getSignInHref('https://evil.example'), '/signin');
});
