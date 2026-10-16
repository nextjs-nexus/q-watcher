import { fetchListMovies } from '@/lib/list-movies';
import Logo from '@/components/Logo';
import Header from '@/components/Header';
import MovieList from '@/components/MovieList';


type Props = {
  searchParams: Promise<{ query?: string; type?: string; genre?: string; status?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const type = resolvedSearchParams?.type || '1';
  const genre = resolvedSearchParams?.genre || '';
  const status = resolvedSearchParams?.status || 'all';

  const { movies, totalPages } = await fetchListMovies({
    query,
    genre,
    type,
    page: 1,
    status,
  });


  const mediaLabel = type === '2' ? 'TV Shows' : type === '0' ? 'Movies and TV Shows' : 'Movies';
  let title = `Top Rated ${mediaLabel} from TMDB`;
  if (query) {
    title = `Search results for "${query}"`;
  } else if (genre) {
    title = `Filtered ${mediaLabel}`;
  }

  if (status === 'toWatch') title = 'Your Watch List';
  if (status === 'watched') title = 'Your Watched Movies & Shows';

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

      <MovieList
        key={JSON.stringify([query, genre, type, status])}
        initialMovies={movies}
        initialTotalPages={totalPages}
        query={query}
        genre={genre}
        type={type}
        status={status}
      />
    </main>
  );
}
