'use client';

import type { MediaPreference } from '@/lib/media-preferences';

import Image from 'next/image';
import Link from 'next/link';
import { CircleUserRound, Star } from 'lucide-react';
import { Movie } from '@/lib/tmdb';
import MovieDetailPreferenceControls from './MovieDetailPreferenceControls';

interface MovieCardProps {
  movie: Movie;
  eager?: boolean;
  returnTo?: string;
  onNavigate?: () => void;
  onPreferenceChange?: (preference: MediaPreference) => void;
}

const imageBase = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ movie, eager = false, returnTo, onNavigate, onPreferenceChange }: MovieCardProps) {
  const mediaType = movie.media_type === 'tv' ? 'tv' : 'movie';

  const detailUrl = `/${mediaType}/${movie.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;

  return (
    <div
      className="group relative bg-[#0A1912]/60 backdrop-blur-xl rounded-b-2xl rounded-tr-2xl overflow-hidden border border-[#B6FF3C]/15 hover:border-[#B6FF3C]/50 transition duration-300 flex flex-col"
    >
      <Link href={detailUrl} onNavigate={onNavigate} className="flex flex-1 flex-col">
        <div className="aspect-2/3 relative">
          {movie.poster_path ? (
            <Image
              src={`${imageBase}${movie.poster_path}`}
              alt={movie.title || 'Movie Poster'}
              fill
              loading={eager ? 'eager' : 'lazy'}
              className="object-cover group-hover:scale-106 group-hover:-mt-3 duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-[#0B1410] flex items-center justify-center text-[#6B7F75]">
              No Image
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-[#050807]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <h2 className="font-semibold text-lg truncate group-hover:text-[#B6FF3C] transition-colors">
            {movie.title}
          </h2>

          <div className="flex items-center justify-between mt-2 text-sm text-[#A0B3A8]">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1 text-[#B6FF3C]"
                title="TMDB rating"
              >
                <Star size={14} fill="currentColor" />
                <span className="font-medium text-white">
                  {Number(movie.vote_average || 0).toFixed(1)}
                </span>
              </div>

              {movie.user_rating != null && (
                <div
                  className="flex items-center gap-1 text-[#A0B3A8]"
                  title="Your rating"
                >
                  <CircleUserRound size={14} color="#B6FF3C"/>
                  <span className="font-medium text-white">
                    {movie.user_rating}
                  </span>
                </div>
              )}
            </div>
            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
          </div>
        </div>
      </Link>
      <MovieDetailPreferenceControls movie={movie} onPreferenceChange={onPreferenceChange} />
    </div>
  );
}
