import Link from 'next/link';
import { searchActors } from '@/lib/tmdb';
import { fetchListMovies } from '@/lib/list-movies';
import Logo from '@/components/Logo';
import Header from '@/components/Header';
import MovieList from '@/components/MovieList';


type Props = {
  searchParams: Promise<{ actor?: string; query?: string; type?: string; genre?: string; status?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const actor = query.trim() && /^[1-9]\d*$/.test(resolvedSearchParams.actor || '') ? resolvedSearchParams.actor : undefined;
  const type = resolvedSearchParams?.type || '1';
  const genre = resolvedSearchParams?.genre || '';
  const status = resolvedSearchParams?.status || 'all';

  const { movies, totalPages } = await fetchListMovies({
    actor,
    query,
    genre,
    type,
    page: 1,
    status,
  });


  const actors = query.trim() ? await searchActors(query) : [];
  const selectedActor = actors.find((person) => String(person.id) === actor);
  const actorUrl = (id?: number) => {
    const params = new URLSearchParams({ query, type, genre, status });
    if (id) params.set('actor', String(id));
    return '/list?' + params.toString();
  };

  const mediaLabel = type === '2' ? 'TV Shows' : type === '0' ? 'Movies and TV Shows' : 'Movies';
  let title = `Top Rated ${mediaLabel} from TMDB`;
  if (query) {
    title = `Search results for "${query}"`;
  } else if (genre) {
    title = `Filtered ${mediaLabel}`;
  }

  if (status === 'toWatch') title = 'Your Watch List';
  if (status === 'watched') title = 'Your Watched Movies & Shows';

  if (actor) title = 'Acting credits' + (selectedActor ? ' for ' + selectedActor.name : '');

  return (
    <main className="min-h-screen p-8 bg-[#050807] text-white flex flex-col">
      <header className="mb-12 flex flex-col justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 md:w-auto items-center lg:self-start">
          <Logo />
          <p className="text-[#A0B3A8] mt-2">{title}</p>
        </div>
        <div className='flex w-full flex-wrap items-center gap-4 lg:flex-nowrap'>
          <Header />
        </div>
      </header>

      {actors.length > 0 && (
        <section aria-label="Matching actors" className="mb-8 rounded-lg border border-[#B6FF3C]/20 bg-[#0B1410] p-4">
          <h2 className="mb-3 text-lg font-medium">Search by actor</h2>
          <p className="mb-4 text-sm text-[#A0B3A8]">Select a person to see their movie and TV acting credits.</p>
          <div className="flex flex-wrap gap-3">
            <Link href={actorUrl()} aria-current={!actor ? 'page' : undefined} className="rounded-lg border border-[#B6FF3C]/30 px-3 py-2 text-sm hover:bg-[#B6FF3C]/10 aria-[current=page]:bg-[#B6FF3C]/20">
              Title results
            </Link>
            {actors.map((person) => (
              <Link key={person.id} href={actorUrl(person.id)} aria-current={String(person.id) === actor ? 'page' : undefined} className="max-w-xs rounded-lg border border-[#B6FF3C]/30 px-3 py-2 text-sm hover:bg-[#B6FF3C]/10 aria-[current=page]:bg-[#B6FF3C]/20">
                <span className="block font-medium">{person.name}</span>
                <span className="block truncate text-xs text-[#A0B3A8]">{person.known_for?.map((item) => item.title || item.name).filter(Boolean).join(', ')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <MovieList
        key={JSON.stringify([actor, query, genre, type, status])}
        initialMovies={movies}
        initialTotalPages={totalPages}
        actor={actor}
        query={query}
        genre={genre}
        type={type}
        status={status}
      />
    </main>
  );
}
