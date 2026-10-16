'use client';

import { updateSavedMediaPreference } from '@/lib/browsing-state';
import { useState, useTransition } from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { markMediaPreference } from '@/actions/media-preferences';
import type { Movie } from '@/lib/tmdb';
import type { MediaPreference } from '@/lib/media-preferences';

export default function MovieCardPreferenceControls({ movie, onPreferenceChange }: { movie: Movie; onPreferenceChange?: (preference: MediaPreference) => void }) {
  const preference = {
    toWatch: movie.to_watch ?? false,
    watched: movie.watched ?? false,
    userRating: movie.user_rating ?? null,
  };
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mark = (status: 'toWatch' | 'watched') => {
    setMessage(null);

    startTransition(async () => {
      try {
        const saved = await markMediaPreference({
          tmdbId: movie.id,
          mediaType: movie.media_type === 'tv' ? 'tv' : 'movie',
          title: movie.title,
          posterPath: movie.poster_path || null,
          releaseDate: movie.release_date || null,
        }, status);
        updateSavedMediaPreference(movie.media_type === 'tv' ? 'tv' : 'movie', movie.id, saved);
        onPreferenceChange?.(saved);
        setMessage(status === 'toWatch' ? 'Added to To Watch' : 'Marked as Watched');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not save your changes.');
      }
    });
  };

  return (
    <>
      <div id="towatch" className="absolute top-0 left-0 h-10 w-8">
        <button
          type="button"
          aria-label="Mark as To Watch"
          title="Mark as To Watch"
          aria-pressed={preference.toWatch}
          disabled={isPending}
          onClick={() => mark('toWatch')}
          className={`flex h-full w-full items-center justify-center rounded-b-md transition hover:text-[#050807] hover:bg-[#B6FF3C] focus-visible:outline-2 focus-visible:outline-[#B6FF3C] disabled:cursor-wait disabled:opacity-70 ${preference?.toWatch ? 'bg-[#B6FF3C] text-[#050807]' : 'bg-[#0B1410]/80 text-[#A0B3A8]'}`}
        >
          <Bookmark size={19} fill={preference?.toWatch ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div id="watched" className="absolute top-0 left-10 h-10 w-8">
        <button
          type="button"
          aria-label="Mark as Watched"
          title="Mark as Watched"
          aria-pressed={preference.watched}
          disabled={isPending}
          onClick={() => mark('watched')}
          className={`flex h-full w-full items-center justify-center rounded-b-md transition hover:text-[#050807] hover:bg-[#B6FF3C] focus-visible:outline-2 focus-visible:outline-[#B6FF3C] disabled:cursor-wait disabled:opacity-70 ${preference?.watched ? 'bg-[#00FFC6] text-[#050807]' : 'bg-[#0B1410]/80 text-[#A0B3A8]'}`}
        >
          <CheckCircle2 size={19} />
        </button>
      </div>
      <div aria-live="polite" className={message ? 'px-4 pb-3 text-xs text-[#A0B3A8]' : 'sr-only'}>
        {message}
      </div>
    </>
  );
}
