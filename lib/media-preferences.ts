import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Movie } from '@/lib/tmdb';

export type MediaType = 'movie' | 'tv';

export type MediaPreference = {
  toWatch: boolean;
  watched: boolean;
  userRating: number | null;
};

const emptyPreference: MediaPreference = {
  toWatch: false,
  watched: false,
  userRating: null,
};

export async function getCurrentUserMediaPreference(
  mediaType: MediaType,
  tmdbId: number
): Promise<MediaPreference> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return emptyPreference;
  }

  const result = await db.query<{
    to_watch: boolean;
    watched: boolean;
    user_rating: number | null;
  }>(
    `SELECT to_watch, watched, user_rating
     FROM user_media_preferences
     WHERE user_id = ? AND tmdb_id = ? AND media_type = ?`,
    [session.user.id, tmdbId, mediaType]
  );

  const preference = result.rows[0];
  if (!preference) {
    return emptyPreference;
  }

  return {
    toWatch: preference.to_watch,
    watched: preference.watched,
    userRating: preference.user_rating,
  };
}

export async function addCurrentUserPreferences(movies: Movie[]): Promise<Movie[]> {
  if (movies.length === 0) {
    return movies;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return movies;
  }

  const requestedTitles = movies.map(() => '(?, ?)').join(', ');

  const result = await db.query<{
    media_type: MediaType;
    tmdb_id: number;
    user_rating: number | null;
    to_watch: boolean;
    watched: boolean;
  }>(
    `SELECT preferences.media_type, preferences.tmdb_id, preferences.user_rating,
            preferences.to_watch, preferences.watched
     FROM user_media_preferences AS preferences
     WHERE preferences.user_id = ?
       AND (preferences.media_type, preferences.tmdb_id) IN (${requestedTitles})`,
    [session.user.id, ...movies.flatMap((movie) => [movie.media_type || 'movie', movie.id])]
  );

  const preferences = new Map(
    result.rows.map((row) => [
      `${row.media_type}-${row.tmdb_id}`,
      row,
    ])
  );

  return movies.map((movie) => {
    const preference = preferences.get(`${movie.media_type || 'movie'}-${movie.id}`);

    return {
      ...movie,
      user_rating: preference?.user_rating ?? null,
      to_watch: preference?.to_watch ?? false,
      watched: preference?.watched ?? false,
    };
  });
}
