'use client';

import { updateSavedMediaPreference } from '@/lib/browsing-state';
import { useState, useTransition } from 'react';
import { Bookmark, Check, CheckCircle2, Star, X } from 'lucide-react';
import { saveMediaPreference } from '@/actions/media-preferences';
import type { MediaPreference, MediaType } from '@/lib/media-preferences';

type MediaPreferenceControlsProps = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  initialPreference: MediaPreference;
};

export default function MediaPreferenceControls({
  tmdbId,
  mediaType,
  title,
  posterPath,
  releaseDate,
  initialPreference,
}: MediaPreferenceControlsProps) {
  const [preference, setPreference] = useState(initialPreference);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = (nextPreference: MediaPreference) => {
    const previousPreference = preference;
    setPreference(nextPreference);
    setMessage(null);

    startTransition(async () => {
      try {
        const saved = await saveMediaPreference({
          tmdbId,
          mediaType,
          title,
          posterPath,
          releaseDate,
          ...nextPreference,
        });
        updateSavedMediaPreference(mediaType, tmdbId, saved);
        setMessage('Saved');
      } catch (error) {
        setPreference(previousPreference);
        setMessage(error instanceof Error ? error.message : 'Could not save your changes.');
      }
    });
  };

  return (
    <section
      aria-labelledby="your-activity-heading"
      className="my-8 rounded-xl border border-[#B6FF3C]/20 bg-[#0A1912]/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 id="your-activity-heading" className="text-xl font-semibold text-white">
          Your activity
        </h2>
        <p className="text-sm leading-relaxed text-[#A0B3A8]">
          Keep both lists active if you plan to watch this title again.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={preference.toWatch}
          disabled={isPending}
          onClick={() => save({ ...preference, toWatch: !preference.toWatch })}
          className={`flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left font-medium transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 ${
            preference.toWatch
              ? 'border-[#B6FF3C] bg-[#B6FF3C] text-[#050807]'
              : 'border-[#B6FF3C]/20 bg-[#050807] text-white hover:border-[#B6FF3C]/70'
          }`}
        >
          <span className="flex items-center gap-2">
            <Bookmark size={19} fill={preference.toWatch ? 'currentColor' : 'none'} />
            To Watch
          </span>
          {preference.toWatch && <Check size={18} aria-hidden="true" />}
        </button>

        <button
          type="button"
          aria-pressed={preference.watched}
          disabled={isPending}
          onClick={() => save({ ...preference, watched: !preference.watched })}
          className={`flex min-h-12 items-center justify-between rounded-lg border px-4 py-3 text-left font-medium transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 ${
            preference.watched
              ? 'border-[#00FFC6] bg-[#00FFC6] text-[#050807]'
              : 'border-[#B6FF3C]/20 bg-[#050807] text-white hover:border-[#B6FF3C]/70'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 size={19} />
            Watched
          </span>
          {preference.watched && <Check size={18} aria-hidden="true" />}
        </button>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-medium text-white">Your rating</h3>
          <span className="text-sm text-[#A0B3A8]">
            {preference.userRating ? `${preference.userRating} / 10` : 'Not rated'}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Your rating out of 10">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => {
            const isSelected = preference.userRating === rating;
            return (
              <button
                key={rating}
                type="button"
                aria-label={`Rate ${rating} out of 10`}
                aria-pressed={isSelected}
                disabled={isPending}
                onClick={() => save({ ...preference, userRating: rating })}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition active:scale-[0.96] disabled:cursor-wait disabled:opacity-70 ${
                  isSelected
                    ? 'border-[#B6FF3C] bg-[#B6FF3C] text-[#050807]'
                    : 'border-[#B6FF3C]/20 bg-[#050807] text-[#A0B3A8] hover:border-[#B6FF3C]/70 hover:text-[#B6FF3C]'
                }`}
              >
                {rating}
              </button>
            );
          })}

          {preference.userRating !== null && (
            <button
              type="button"
              aria-label="Clear your rating"
              disabled={isPending}
              onClick={() => save({ ...preference, userRating: null })}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-[#B6FF3C]/20 bg-[#050807] px-3 text-sm font-medium text-[#A0B3A8] transition hover:border-[#B6FF3C]/50 hover:text-white active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 min-h-5" aria-live="polite">
        {message && (
          <p className={`flex items-center gap-1.5 text-sm ${message === 'Saved' ? 'text-[#B6FF3C]' : 'text-red-400'}`}>
            {message === 'Saved' && <Star size={14} fill="currentColor" />}
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
