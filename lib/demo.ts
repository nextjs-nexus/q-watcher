// Shared demo account settings. This module has no server dependencies so it can be tested directly.

export type DemoConfig = {
  email: string;
  password: string;
};

export type DemoTitle = {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  toWatch: boolean;
  watched: boolean;
  userRating: number | null;
};

type Environment = Record<string, string | undefined>;

export const DEMO_RESET_INTERVAL_SECONDS = 24 * 60 * 60;

// Account endpoints a demo visitor must not use, because the account is shared.
export const DEMO_SESSION_RESTRICTED_PATHS = [
  '/change-email',
  '/change-password',
  '/delete-user',
  '/list-sessions',
  '/revoke-other-sessions',
  '/revoke-session',
  '/revoke-sessions',
  '/set-password',
  '/update-user',
];

// Endpoints that receive the demo email address in the request body.
export const DEMO_EMAIL_RESTRICTED_PATHS = [
  '/request-password-reset',
  '/send-verification-email',
  '/sign-up/email',
];

// Sample lists restored on every reset, newest first.
export const DEMO_TITLES: DemoTitle[] = [
  { tmdbId: 1396, mediaType: 'tv', title: 'Breaking Bad', toWatch: false, watched: true, userRating: 10 },
  { tmdbId: 157336, mediaType: 'movie', title: 'Interstellar', toWatch: true, watched: false, userRating: null },
  { tmdbId: 278, mediaType: 'movie', title: 'The Shawshank Redemption', toWatch: false, watched: true, userRating: 10 },
  { tmdbId: 94605, mediaType: 'tv', title: 'Arcane', toWatch: true, watched: false, userRating: null },
  { tmdbId: 27205, mediaType: 'movie', title: 'Inception', toWatch: false, watched: true, userRating: 8 },
  { tmdbId: 129, mediaType: 'movie', title: 'Spirited Away', toWatch: true, watched: false, userRating: null },
  { tmdbId: 87108, mediaType: 'tv', title: 'Chernobyl', toWatch: false, watched: true, userRating: 9 },
  { tmdbId: 680, mediaType: 'movie', title: 'Pulp Fiction', toWatch: true, watched: true, userRating: 8 },
  { tmdbId: 496243, mediaType: 'movie', title: 'Parasite', toWatch: true, watched: false, userRating: null },
  { tmdbId: 238, mediaType: 'movie', title: 'The Godfather', toWatch: false, watched: true, userRating: 9 },
  { tmdbId: 66732, mediaType: 'tv', title: 'Stranger Things', toWatch: true, watched: false, userRating: null },
  { tmdbId: 155, mediaType: 'movie', title: 'The Dark Knight', toWatch: false, watched: true, userRating: 9 },
];

export function getDemoConfig(env: Environment = process.env): DemoConfig | null {
  const email = env.DEMO_USER_EMAIL?.trim().toLowerCase();
  const password = env.DEMO_USER_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export function isDemoEmail(email: unknown, env: Environment = process.env): boolean {
  const config = getDemoConfig(env);

  return Boolean(config && typeof email === 'string' && email.trim().toLowerCase() === config.email);
}

// The age comes from the database clock, so app and database time zones cannot disagree.
export function isDemoResetDue(secondsSinceReset: unknown): boolean {
  const seconds = Number(secondsSinceReset);

  if (secondsSinceReset === null || secondsSinceReset === undefined || !Number.isFinite(seconds)) {
    return true;
  }

  return seconds >= DEMO_RESET_INTERVAL_SECONDS;
}
