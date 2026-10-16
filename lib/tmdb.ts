const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    vote_average: number;
    release_date: string;
    runtime: number;
    tagline: string;
    genres: { id: number; name: string }[];
    media_type?: 'movie' | 'tv';
    user_rating?: number | null;
    to_watch?: boolean;
    watched?: boolean;
}

export interface TMDBPaginatedResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface MediaVideo {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}

export async function getMediaTrailers(id: string, mediaType: 'movie' | 'tv'): Promise<MediaVideo[]> {
    try {
        const data: { results: MediaVideo[] } = await fetchFromTMDB(`/${mediaType}/${id}/videos`);
        const seenKeys = new Set<string>();

        return (data.results || [])
            .filter((video) => {
                if (video.site !== 'YouTube' || video.type !== 'Trailer' || !/^[\w-]{11}$/.test(video.key) || seenKeys.has(video.key)) {
                    return false;
                }

                seenKeys.add(video.key);
                return true;
            })
            .sort((a, b) => Number(b.official) - Number(a.official));
    } catch {
        // Optional trailers should not prevent the detail page from rendering.
        return [];
    }
}

export interface FetchMoviesResult {
    movies: Movie[];
    totalPages: number;
    page: number;
    totalResults: number;
}

async function fetchFromTMDB(endpoint: string, page: number = 1) {
    if (!API_KEY) throw new Error('API Key is missing');

    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=en-US&page=${page}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
}

export async function getTopRatedMovies(page: number = 1): Promise<FetchMoviesResult> {
    const data: TMDBPaginatedResponse = await fetchFromTMDB('/movie/top_rated', page);
    return toFetchMoviesResult(data, 'movie');
}

export async function searchMovies(query: string, page: number = 1): Promise<FetchMoviesResult> {
    const data: TMDBPaginatedResponse = await fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}`, page);
    return toFetchMoviesResult(data, 'movie');
}

export async function searchTVShows(query: string, page: number = 1): Promise<FetchMoviesResult> {
    const data: TMDBPaginatedResponse = await fetchFromTMDB(`/search/tv?query=${encodeURIComponent(query)}`, page);
    return toFetchMoviesResult(data, 'tv');
}

export async function searchMoviesAndTVShows(query: string, page: number = 1): Promise<FetchMoviesResult> {
    const data: TMDBPaginatedResponse = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`, page);
    return toFetchMoviesResult(data);
}

function toFetchMoviesResult(
    data: TMDBPaginatedResponse,
    mediaType?: 'movie' | 'tv'
): FetchMoviesResult {
    const results = (data.results || [])
        .filter((item) => mediaType || item.media_type === 'movie' || item.media_type === 'tv')
        .map((item) => {
            const tvItem = item as Movie & { name?: string; first_air_date?: string };
            return {
                ...item,
                title: item.title || tvItem.name || 'Untitled',
                release_date: item.release_date || tvItem.first_air_date || '',
                media_type: mediaType || item.media_type,
            };
        });

    return {
        movies: results,
        totalPages: data.total_pages || 1,
        page: data.page || 1,
        totalResults: data.total_results || 0,
    };
}

export async function getMoviesByGenre(genreId: string, page: number = 1): Promise<FetchMoviesResult> {
    const data: TMDBPaginatedResponse = await fetchFromTMDB(`/discover/movie?with_genres=${genreId}&sort_by=vote_average.desc`, page);
    return toFetchMoviesResult(data, 'movie');
}

export async function getTopRatedTVShows(page: number = 1): Promise<FetchMoviesResult> {
    const data: TMDBPaginatedResponse = await fetchFromTMDB('/tv/top_rated', page);
    return toFetchMoviesResult(data, 'tv');
}

export async function getTVShowsByGenre(genreId: string, page: number = 1): Promise<FetchMoviesResult> {
    // The shared selector uses movie IDs; TV combines Action/Adventure and Sci-Fi/Fantasy.
    // TMDB has no standalone TV Horror genre.
    const tvGenres: Record<string, string> = {
        '28': '10759',
        '878': '10765',
    };
    if (genreId === '27') {
        return { movies: [], totalPages: 1, page, totalResults: 0 };
    }

    const data: TMDBPaginatedResponse = await fetchFromTMDB(
        `/discover/tv?with_genres=${tvGenres[genreId] || genreId}&sort_by=vote_average.desc`,
        page
    );
    return toFetchMoviesResult(data, 'tv');
}

function combineResults(movies: FetchMoviesResult, tvShows: FetchMoviesResult): FetchMoviesResult {
    return {
        movies: [...movies.movies, ...tvShows.movies].sort((a, b) => b.vote_average - a.vote_average),
        totalPages: Math.max(movies.totalPages, tvShows.totalPages),
        page: movies.page,
        totalResults: movies.totalResults + tvShows.totalResults,
    };
}

export async function fetchMovies({
    query = '',
    genre = '',
    type = '1',
    page = 1,
}: {
    query?: string;
    genre?: string;
    type?: string;
    page?: number;
} = {}): Promise<FetchMoviesResult> {
    if (query.trim()) {
        if (type === '1') {
            return searchMovies(query.trim(), page);
        }

        if (type === '2') {
            return searchTVShows(query.trim(), page);
        }

        return searchMoviesAndTVShows(query.trim(), page);
    }

    const getMovies = () => genre ? getMoviesByGenre(genre, page) : getTopRatedMovies(page);
    const getTVShows = () => genre ? getTVShowsByGenre(genre, page) : getTopRatedTVShows(page);

    if (type === '2') {
        return getTVShows();
    }
    if (type === '0') {
        const [movies, tvShows] = await Promise.all([getMovies(), getTVShows()]);
        return combineResults(movies, tvShows);
    }
    return getMovies();
}

export async function getMovie(id: string) {
    const data = await fetchFromTMDB(`/movie/${id}`);
    return {
        ...data,
        media_type: 'movie',
        media_label: data.video ? 'Video' : 'Movie',
    };
}

export async function getTVShow(id: string) {
    const data = await fetchFromTMDB(`/tv/${id}`);
    const tvTypeLabels: Record<string, string> = {
        Miniseries: 'TV Mini Series',
        Scripted: 'TV Series',
        Reality: 'Reality TV',
        Documentary: 'TV Documentary',
        News: 'TV News',
        'Talk Show': 'TV Talk Show',
        Video: 'TV Series',
    };

    return {
        ...data,
        title: data.name || 'Untitled',
        release_date: data.first_air_date || '',
        runtime: data.episode_run_time?.[0] || 0,
        media_type: 'tv',
        media_label: tvTypeLabels[data.type] || (data.type ? `TV ${data.type}` : 'TV Series'),
    };
}
