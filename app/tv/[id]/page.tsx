import { getListUrl } from '@/lib/browsing-state';
import Logo from '@/components/Logo';
import { getTVShow, getMediaTrailers } from '@/lib/tmdb';
import TrailerThumbnails from '@/components/TrailerThumbnails';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Star, Tv } from 'lucide-react';
import UserNav from '@/components/UserNav';
import MediaPreferenceControls from '@/components/MediaPreferenceControls';
import { getCurrentUserMediaPreference } from '@/lib/media-preferences';
import BackButton from '@/components/BackButton';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function TVShowPage({ params, searchParams }: Props) {
  const { id } = await params;
  const returnTo = getListUrl((await searchParams).returnTo ?? null);
  const [show, preference, trailers] = await Promise.all([
    getTVShow(id),
    getCurrentUserMediaPreference('tv', Number(id)),
    getMediaTrailers(id, 'tv'),
  ]);
  const imageBase = 'https://image.tmdb.org/t/p/w500';
  const backdropBase = 'https://image.tmdb.org/t/p/original';

  return (
    <main className="min-h-screen bg-[#050807] text-white relative">
      {show.backdrop_path && (
        <div className="absolute inset-0 h-[50vh] w-full overflow-hidden opacity-20">
          <Image
            src={`${backdropBase}${show.backdrop_path}`}
            alt={show.title}
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
              {show.poster_path ? (
                <Image
                  src={`${imageBase}${show.poster_path}`}
                  alt={show.title}
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
              <Tv size={16} />
              <span>{show.media_label}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{show.title}</h1>

            {show.tagline && (
              <p className="text-xl text-[#B6FF3C] italic mb-6">
                &quot;{show.tagline}&quot;
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-[#A0B3A8]">
              <div className="flex items-center gap-2 text-[#B6FF3C]">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-white text-base">
                  {Number(show.vote_average || 0).toFixed(1)}
                </span>
                <span className="text-[#A0B3A8]">({show.vote_count || 0} votes)</span>
              </div>

              {show.runtime > 0 && (
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{show.runtime} min per episode</span>
                </div>
              )}

              {show.release_date && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>
                    {new Date(show.release_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres?.map((genre: { id: number; name: string }) => (
                <span
                  key={genre.id}
                  className="px-3 py-1.5 bg-[#0B1410] border border-[#B6FF3C]/20 rounded-md text-sm font-medium text-[#A0B3A8]"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-[#A0B3A8] leading-relaxed">{show.overview}</p>
            </div>

            <MediaPreferenceControls
              tmdbId={show.id}
              mediaType="tv"
              title={show.title}
              posterPath={show.poster_path || null}
              releaseDate={show.release_date || null}
              initialPreference={preference}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
