import Image from 'next/image';
import { Play } from 'lucide-react';
import type { MediaVideo } from '@/lib/tmdb';

export default function TrailerThumbnails({ trailers }: { trailers: MediaVideo[] }) {
  if (trailers.length === 0) return null;

  return (
    <section className="mt-6" aria-label="Trailers">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Trailers</h2>
        <span className="text-xs text-[#A0B3A8]">Watch on YouTube</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {trailers.map((trailer) => (
          <a
            key={trailer.key}
            href={`https://www.youtube.com/watch?v=${trailer.key}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${trailer.name} on YouTube (opens in a new tab)`}
            className="group min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B6FF3C]"
          >
            <div className="relative aspect-video overflow-hidden rounded-lg border border-[#B6FF3C]/15 bg-[#0B1410] transition-colors group-hover:border-[#B6FF3C]/50">
              <Image
                src={`https://i.ytimg.com/vi/${trailer.key}/hqdefault.jpg`}
                alt=""
                fill
                sizes="(max-width: 767px) 50vw, 180px"
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#050807]/80 text-[#B6FF3C]">
                  <Play size={16} fill="currentColor" aria-hidden="true" />
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm leading-snug text-[#A0B3A8] transition-colors group-hover:text-[#B6FF3C]">
              {trailer.name}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
