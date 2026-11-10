import Link from 'next/link';
import { Lock } from 'lucide-react';
import { searchActors } from '@/lib/tmdb';
import { fetchListMovies } from '@/lib/list-movies';
import { getViewer } from '@/lib/session';
import Logo from '@/components/Logo';
import Header from '@/components/Header';
import MovieList from '@/components/MovieList';
import DemoSignInButton from '@/components/DemoSignInButton';
import SignInLink from '@/components/SignInLink';


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
  const viewer = await getViewer();
  const isPersonalList = status === 'toWatch' || status === 'watched';
  const showGuestListPrompt = isPersonalList && !viewer.signedIn;
  const currentListParams = new URLSearchParams(
    Object.entries(resolvedSearchParams).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== '')
  );
  const currentListPath = `/list?${currentListParams.toString()}`;

  const { movies, totalPages } = showGuestListPrompt
    ? { movies: [], totalPages: 1 }
    : await fetchListMovies({
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

      {showGuestListPrompt ? (
        <section className="mx-auto mt-8 w-full max-w-lg rounded-2xl border border-[#B6FF3C]/20 bg-[#0B1410] p-8 text-center">
          <Lock size={28} className="mx-auto text-[#B6FF3C]" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold">Your lists are waiting</h2>
          <p className="mt-3 leading-relaxed text-[#A0B3A8]">
            To Watch and Watched lists are available after you log in.
            You can keep browsing every movie and TV show without an account.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <SignInLink className="w-full rounded-lg bg-[#B6FF3C] px-4 py-3 font-semibold text-[#050807] transition hover:bg-[#B6FF3C]/80">
              Log in
            </SignInLink>
            <Link href="/signup" className="w-full rounded-lg border border-white/15 px-4 py-3 font-medium transition hover:border-[#B6FF3C]/50">
              Sign up free
            </Link>
            {viewer.demoAvailable && (
              <DemoSignInButton next={currentListPath} variant="secondary" />
            )}
          </div>
        </section>
      ) : (
        <MovieList
          key={JSON.stringify([actor, query, genre, type, status])}
          initialMovies={movies}
          initialTotalPages={totalPages}
          viewer={viewer}
          actor={actor}
          query={query}
          genre={genre}
          type={type}
          status={status}
        />
      )}
    </main>
  );
}
