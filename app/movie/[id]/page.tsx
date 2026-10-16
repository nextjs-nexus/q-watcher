import { getListUrl } from '@/lib/browsing-state';
import Logo from '@/components/Logo';
import { getMovie, getMediaTrailers } from '@/lib/tmdb';
import TrailerThumbnails from '@/components/TrailerThumbnails';
import Image from 'next/image';
import { Star, Clock, Calendar, Film } from 'lucide-react';
import UserNav from '@/components/UserNav';
import MediaPreferenceControls from '@/components/MediaPreferenceControls';
import { getCurrentUserMediaPreference } from '@/lib/media-preferences';
import BackButton from '@/components/BackButton';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function MoviePage({ params, searchParams }: Props) {
  const { id } = await params;
  const returnTo = getListUrl((await searchParams).returnTo ?? null);
  const [movie, preference, trailers] = await Promise.all([
    getMovie(id),
    getCurrentUserMediaPreference('movie', Number(id)),
    getMediaTrailers(id, 'movie'),
  ]);

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const backgroundBaseUrl = 'https://image.tmdb.org/t/p/original';

  return (
    <main className="min-h-screen bg-[#050807] text-white relative">
      {movie.backdrop_path && (
        <div className="absolute inset-0 h-[50vh] w-full overflow-hidden opacity-20">
          <Image
            src={`${backgroundBaseUrl}${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#050807] to-transparent" />
        </div>
      )}

      <div className="relative max-w-6xl mx-auto p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Logo href={returnTo} />
            <BackButton />
          </div>
          <UserNav />
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 md:shrink-0">
            <div className="aspect-2/3 relative rounded-tr-xl rounded-b-xl overflow-hidden shadow-2xl border border-[#B6FF3C]/15">
              {movie.poster_path ? (
                <Image
                  src={`${imageBaseUrl}${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-[#0B1410] flex items-center justify-center text-[#6B7F75]">
                  No Image
                </div>
              )}
            </div>
            <TrailerThumbnails trailers={trailers} />
          </div>

          <div className="w-full md:w-2/3">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-md bg-[#B6FF3C]/10 border border-[#B6FF3C]/30 text-sm font-semibold text-[#B6FF3C]">
              <Film size={16} />
              <span>{movie.media_label}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
            
            {movie.tagline && (
              <p className="text-xl text-[#B6FF3C] italic mb-6">
                &quot;{movie.tagline}&quot;
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-[#A0B3A8]">
              <div className="flex items-center gap-2 text-[#B6FF3C]">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-white text-base">
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-[#A0B3A8]">({movie.vote_count} votes)</span>
              </div>

              {movie.runtime > 0 && (
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                </div>
              )}

              {movie.release_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{new Date(movie.release_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((genre: { id: number; name: string }) => (
                <span
                  key={genre.id}
                  className="px-3 py-1.5 bg-[#0B1410] border border-[#B6FF3C]/20 rounded-md text-sm font-medium text-[#A0B3A8]"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-[#A0B3A8] leading-relaxed">{movie.overview}</p>
            </div>

            <MediaPreferenceControls
              tmdbId={movie.id}
              mediaType="movie"
              title={movie.title}
              posterPath={movie.poster_path || null}
              releaseDate={movie.release_date || null}
              initialPreference={preference}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
