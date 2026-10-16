'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { MediaPreference, MediaType } from '@/lib/media-preferences';
import { getCurrentUserMediaPreference } from '@/lib/media-preferences';

type SaveMediaPreferenceInput = MediaPreference & {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
};

export async function markMediaPreference(
  input: Omit<SaveMediaPreferenceInput, keyof MediaPreference>,
  status: 'toWatch' | 'watched'
): Promise<MediaPreference> {
  if (status !== 'toWatch' && status !== 'watched') {
    throw new Error('Invalid watch status.');
  }

  const preference = await getCurrentUserMediaPreference(input.mediaType, input.tmdbId);

  return saveMediaPreference({ ...input, ...preference, [status]: true });
}

export async function saveMediaPreference(
  input: SaveMediaPreferenceInput
): Promise<MediaPreference> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('You must be signed in to save this title.');
  }

  if (!Number.isInteger(input.tmdbId) || input.tmdbId <= 0) {
    throw new Error('Invalid TMDB title.');
  }

  if (input.mediaType !== 'movie' && input.mediaType !== 'tv') {
    throw new Error('Invalid media type.');
  }

  if (
    input.userRating !== null &&
    (!Number.isInteger(input.userRating) || input.userRating < 1 || input.userRating > 10)
  ) {
    throw new Error('Your rating must be between 1 and 10.');
  }

  const title = input.title.trim().slice(0, 300);
  if (!title) {
    throw new Error('A title is required.');
  }

  await db.query(
    `INSERT INTO user_media_preferences (
       user_id,
       tmdb_id,
       media_type,
       title,
       poster_path,
       release_date,
       to_watch,
       watched,
       user_rating,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       poster_path = VALUES(poster_path),
       release_date = VALUES(release_date),
       to_watch = VALUES(to_watch),
       watched = VALUES(watched),
       user_rating = VALUES(user_rating),
       updated_at = NOW()`,
    [
      session.user.id,
      input.tmdbId,
      input.mediaType,
      title,
      input.posterPath,
      input.releaseDate,
      input.toWatch,
      input.watched,
      input.userRating,
    ]
  );

  revalidatePath(`/${input.mediaType}/${input.tmdbId}`);
  revalidatePath('/list');

  return {
    toWatch: input.toWatch,
    watched: input.watched,
    userRating: input.userRating,
  };
}
