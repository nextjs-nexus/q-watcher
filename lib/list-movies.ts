import 'server-only';

import { db } from '@/lib/db';
import { addCurrentUserPreferences } from '@/lib/media-preferences';
import { getCurrentUser } from '@/lib/session';
import { fetchMovies, getActorCredits, getMovie, getTVShow, type FetchMoviesResult, type Movie } from '@/lib/tmdb';

export type ListCriteria = {
    actor?: string;
    query?: string;
    genre?: string;
    type?: string;
    status?: string;
    page?: number;
};

export async function fetchListMovies({ actor = '', query = '', genre = '', type = '1', status = 'all', page = 1 }: ListCriteria): Promise<FetchMoviesResult> {
    const credits = actor && query.trim() ? await getActorCredits(actor, type) : null;
    if (status !== 'toWatch' && status !== 'watched') {
        const matchingCredits = credits?.filter((movie) => {
            if (!genre) return true;
            const tvGenres: Record<string, string> = { '28': '10759', '878': '10765' };
            if (movie.media_type === 'tv' && genre === '27') return false;
            const genreId = movie.media_type === 'tv' ? tvGenres[genre] || genre : genre;
            return (movie as Movie & { genre_ids?: number[] }).genre_ids?.includes(Number(genreId));
        });
        const result = matchingCredits ? {
            movies: matchingCredits.slice((page - 1) * 20, page * 20),
            totalPages: Math.max(1, Math.ceil(matchingCredits.length / 20)),
            totalResults: matchingCredits.length,
            page,
        } : await fetchMovies({ query, genre, type, page });
        return { ...result, movies: await addCurrentUserPreferences(result.movies) };
    }

    const user = await getCurrentUser();
    if (!user?.id) {
        return { movies: [], totalPages: 1, totalResults: 0, page };
    }

    // Start with the user's entire saved list, rather than only the current TMDB page.
    const result = await db.query<{
        tmdb_id: number;
        media_type: 'movie' | 'tv';
        to_watch: boolean;
        watched: boolean;
        user_rating: number | null;
    }>(
        `SELECT tmdb_id, media_type, to_watch, watched, user_rating
         FROM user_media_preferences
         WHERE user_id = ?
           AND ((? = 'toWatch' AND to_watch) OR (? = 'watched' AND watched))
           AND (? = '0' OR media_type = ?)
           AND (? = '' OR POSITION(LOWER(?) IN LOWER(title)) > 0)
         ORDER BY updated_at DESC, media_type, tmdb_id`,
        [user.id, status, status, type, type === '2' ? 'tv' : 'movie', credits ? '' : query.trim(), credits ? '' : query.trim()]
    );

    if (credits) {
        const creditIds = new Set(credits.map((movie) => `${movie.media_type}-${movie.id}`));
        result.rows = result.rows.filter((row) => creditIds.has(`${row.media_type}-${row.tmdb_id}`));
    }

    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const rows = genre ? result.rows : result.rows.slice(start, start + pageSize);
    const movies: Movie[] = [];
    // Keep TMDB requests bounded when genre filtering requires title details.
    for (let offset = 0; offset < rows.length; offset += 8) {
        const batch = await Promise.all(rows.slice(offset, offset + 8).map(async (row) => {
            const movie = row.media_type === 'tv'
                ? await getTVShow(String(row.tmdb_id))
                : await getMovie(String(row.tmdb_id));
            return { ...movie, to_watch: row.to_watch, watched: row.watched, user_rating: row.user_rating } as Movie;
        }));
        movies.push(...batch);
    }

    const tvGenre: Record<string, string> = { '28': '10759', '878': '10765' };
    const filtered = genre ? movies.filter((movie) => {
        if (movie.media_type === 'tv' && genre === '27') return false;
        const genreId = movie.media_type === 'tv' ? tvGenre[genre] || genre : genre;
        return movie.genres.some((item) => String(item.id) === genreId);
    }) : movies;
    const totalResults = genre ? filtered.length : result.rows.length;

    return {
        movies: genre ? filtered.slice(start, start + pageSize) : filtered,
        totalPages: Math.max(1, Math.ceil(totalResults / pageSize)),
        totalResults,
        page,
    };
}
