import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEMO_RESET_INTERVAL_SECONDS,
  DEMO_TITLES,
  getDemoConfig,
  isDemoEmail,
  isDemoResetDue,
} from '../lib/demo';

const env = {
  DEMO_USER_EMAIL: ' Demo@Example.com ',
  DEMO_USER_PASSWORD: 'Demo-password-123!',
};

test('the demo account is enabled only when both settings are present', () => {
  assert.deepEqual(getDemoConfig(env), { email: 'demo@example.com', password: 'Demo-password-123!' });
  assert.equal(getDemoConfig({ DEMO_USER_EMAIL: 'demo@example.com' }), null);
  assert.equal(getDemoConfig({ DEMO_USER_PASSWORD: 'secret' }), null);
  assert.equal(getDemoConfig({}), null);
});

test('demo email matching ignores case and surrounding spaces', () => {
  assert.equal(isDemoEmail('DEMO@example.com', env), true);
  assert.equal(isDemoEmail('someone@example.com', env), false);
  assert.equal(isDemoEmail(undefined, env), false);
  assert.equal(isDemoEmail('demo@example.com', {}), false);
});

test('the demo account resets when never reset or older than one day', () => {
  assert.equal(isDemoResetDue(null), true);
  assert.equal(isDemoResetDue(undefined), true);
  assert.equal(isDemoResetDue('not a number'), true);
  assert.equal(isDemoResetDue(0), false);
  assert.equal(isDemoResetDue(DEMO_RESET_INTERVAL_SECONDS - 1), false);
  assert.equal(isDemoResetDue(DEMO_RESET_INTERVAL_SECONDS), true);
  // MariaDB can return TIMESTAMPDIFF results as strings.
  assert.equal(isDemoResetDue(String(DEMO_RESET_INTERVAL_SECONDS + 60)), true);
});

test('demo sample titles are unique, valid, and fill both lists', () => {
  const keys = new Set(DEMO_TITLES.map((title) => `${title.mediaType}-${title.tmdbId}`));
  assert.equal(keys.size, DEMO_TITLES.length);
  assert.ok(DEMO_TITLES.some((title) => title.toWatch));
  assert.ok(DEMO_TITLES.some((title) => title.watched));
  assert.ok(DEMO_TITLES.some((title) => title.mediaType === 'tv'));

  for (const title of DEMO_TITLES) {
    assert.ok(Number.isInteger(title.tmdbId) && title.tmdbId > 0, title.title);
    assert.ok(title.toWatch || title.watched, title.title);
    assert.ok(title.userRating === null || (Number.isInteger(title.userRating) && title.userRating >= 1 && title.userRating <= 10), title.title);
  }
});
