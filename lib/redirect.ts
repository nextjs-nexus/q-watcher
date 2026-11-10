const DEFAULT_REDIRECT_PATH = '/list';
const REDIRECT_BASE = 'http://q-watcher.invalid';

/**
 * Returns a same-site path for post-login redirects.
 * Absolute URLs, protocol-relative URLs, and authentication pages fall back to /list.
 */
export function getSafeRedirectPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return DEFAULT_REDIRECT_PATH;
  }

  let url: URL;
  try {
    url = new URL(value, REDIRECT_BASE);
  } catch {
    return DEFAULT_REDIRECT_PATH;
  }

  if (url.origin !== REDIRECT_BASE) {
    return DEFAULT_REDIRECT_PATH;
  }

  const authenticationPaths = ['/signin', '/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];
  if (authenticationPaths.includes(url.pathname) || url.pathname.startsWith('/api/')) {
    return DEFAULT_REDIRECT_PATH;
  }

  return url.pathname + url.search;
}

export function getSignInHref(nextPath: string): string {
  const safePath = getSafeRedirectPath(nextPath);
  return safePath === DEFAULT_REDIRECT_PATH ? '/signin' : `/signin?next=${encodeURIComponent(safePath)}`;
}
