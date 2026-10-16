'use server';

import { FetchMoviesResult } from '@/lib/tmdb';
import { fetchListMovies } from '@/lib/list-movies';
import { addCurrentUserPreferences } from '@/lib/media-preferences';

export async function loadMoreMoviesAction({
  query = '',
  genre = '',
  type = '1',
  page = 1,
  status = 'all',
}: {
  query?: string;
  genre?: string;
  type?: string;
  page?: number;
  status?: string;
}): Promise<FetchMoviesResult> {
  const result = await fetchListMovies({ query, genre, type, page, status });

  return result;
}

export async function refreshListPreferencesAction(
  titles: { id: number; media_type: 'movie' | 'tv' }[]
) {
  if (titles.length > 10000 || titles.some((title) => !Number.isInteger(title.id) || title.id <= 0 || !['movie', 'tv'].includes(title.media_type))) {
    throw new Error('Invalid title list.');
  }
  return addCurrentUserPreferences(titles as import('@/lib/tmdb').Movie[]);
}
