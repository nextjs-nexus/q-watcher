'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Movie } from '@/lib/tmdb';
import { loadMoreMoviesAction, refreshListPreferencesAction } from '@/actions/movies';
import MovieDetail from './MovieDetail';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { readBrowsingState, saveBrowsingState } from '@/lib/browsing-state';

interface MovieListProps {
  initialMovies: Movie[];
  initialTotalPages: number;
  query?: string;
  genre?: string;
  type?: string;
  status?: string;
}

export default function MovieList({
  initialMovies,
  initialTotalPages,
  query = '',
  genre = '',
  type = '1',
  status = 'all',
}: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(1 < initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const listUrl = searchParams.toString() ? `/list?${searchParams.toString()}` : '/list';
  const restoreScrollRef = useRef<number | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);
  const pageRef = useRef(page);

  loadingRef.current = isLoading;
  hasMoreRef.current = hasMore;
  pageRef.current = page;

  useLayoutEffect(() => {
    const saved = readBrowsingState(listUrl);
    // Restore the full list before the browser paints or starts observing the sentinel.
    const freshFirstPage = new Map(initialMovies.map((movie) => [`${movie.media_type || 'movie'}-${movie.id}`, movie]));
    const restoredMovies = saved?.movies.map((movie) => freshFirstPage.get(`${movie.media_type || 'movie'}-${movie.id}`) || movie) || initialMovies;
    setMovies(restoredMovies);
    let cancelled = false;
    if (saved) {
      refreshListPreferencesAction(restoredMovies.map((movie) => ({ id: movie.id, media_type: movie.media_type === 'tv' ? 'tv' : 'movie' })))
        .then((freshMovies) => {
          if (cancelled) return;
          const preferences = new Map(freshMovies.map((movie) => [`${movie.media_type || 'movie'}-${movie.id}`, movie]));
          setMovies((current) => current.map((movie) => {
            const fresh = preferences.get(`${movie.media_type || 'movie'}-${movie.id}`);
            return fresh ? { ...movie, to_watch: fresh.to_watch, watched: fresh.watched, user_rating: fresh.user_rating } : movie;
          }));
        })
        .catch((error) => console.error('Failed to refresh saved watch marks:', error));
    }
    setPage(saved?.page || 1);
    pageRef.current = saved?.page || 1;
    const more = saved ? saved.hasMore : 1 < initialTotalPages;
    setHasMore(more);
    hasMoreRef.current = more;
    setIsLoading(false);
    loadingRef.current = false;
    restoreScrollRef.current = saved?.scrollY ?? 0;
    setIsRestored(true);
    return () => { cancelled = true; };
  }, [initialMovies, initialTotalPages, listUrl]);

  useLayoutEffect(() => {
    if (!isRestored || restoreScrollRef.current === null) return;
    const scrollY = restoreScrollRef.current;
    window.scrollTo({ top: scrollY, behavior: 'instant' });
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      restoreScrollRef.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [isRestored, movies]);

  const rememberBrowsing = () => {
    saveBrowsingState({ url: listUrl, movies, page, hasMore, scrollY: window.scrollY });
  };

  const loadMore = useCallback(async () => {
    if (restoreScrollRef.current !== null || loadingRef.current || !hasMoreRef.current) return;

    setIsLoading(true);
    loadingRef.current = true;
    const nextPage = pageRef.current + 1;

    try {
      const res = await loadMoreMoviesAction({
        query,
        genre,
        type,
        page: nextPage,
        status,
      });

      if (res.movies && res.movies.length > 0) {
        setMovies((prev) => {
          const getMediaKey = (movie: Movie) => `${movie.media_type || 'movie'}-${movie.id}`;
          const existingIds = new Set(prev.map(getMediaKey));
          const newMovies = res.movies.filter((movie) => !existingIds.has(getMediaKey(movie)));
          return [...prev, ...newMovies];
        });

        pageRef.current = nextPage;
        setPage(nextPage);

        const more = nextPage < res.totalPages;
        setHasMore(more);
        hasMoreRef.current = more;
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (error) {
      console.error('Failed to load more movies:', error);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [query, genre, type, status]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isRestored) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          loadMore();
        }
      },
      {
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, isRestored]);

  const visibleMovies = movies.filter((movie) => status === 'toWatch' ? movie.to_watch : status === 'watched' ? movie.watched : true);

  if (visibleMovies.length === 0 && !isLoading && !hasMore) {
    return (
      <div className="text-center py-20 text-[#A0B3A8]">
        <p className="text-xl">No movies or TV shows found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {visibleMovies.map((movie, index) => (
          <MovieDetail
            key={`${movie.media_type || 'movie'}-${movie.id}`}
            movie={movie}
            eager={index < 6}
            returnTo={listUrl}
            onNavigate={rememberBrowsing}
            onPreferenceChange={(preference) => setMovies((current) => current.map((item) => (
              item.id === movie.id && (item.media_type || 'movie') === (movie.media_type || 'movie')
                ? { ...item, to_watch: preference.toWatch, watched: preference.watched, user_rating: preference.userRating }
                : item
            )))}
          />
        ))}
      </div>

      {/* Sentinel element for IntersectionObserver */}
      <div ref={sentinelRef} className="h-4 w-full" />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="flex items-center gap-2 text-[#B6FF3C] bg-[#0A1912]/60 border border-[#B6FF3C]/15 px-4 py-2 rounded-md shadow-lg">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium text-[#A0B3A8]">Loading more...</span>
          </div>
        </div>
      )}

      {/* End of list state */}
      {!hasMore && movies.length > 0 && !isLoading && (
        <div className="text-center py-12 text-[#6B7F75] text-sm">
          You&apos;ve reached the end of the list.
        </div>
      )}
    </div>
  );
}
