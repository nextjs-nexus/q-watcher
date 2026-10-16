import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { addCurrentUserPreferences } from '@/lib/media-preferences';
import { fetchMovies, getMovie, getTVShow, type FetchMoviesResult, type Movie } from '@/lib/tmdb';

export type ListCriteria = {
    query?: string;
    genre?: string;
    type?: string;
    status?: string;
    page?: number;
};

export async function fetchListMovies({ query = '', genre = '', type = '1', status = 'all', page = 1 }: ListCriteria): Promise<FetchMoviesResult> {
    if (status !== 'toWatch' && status !== 'watched') {
        const result = await fetchMovies({ query, genre, type, page });
        return { ...result, movies: await addCurrentUserPreferences(result.movies) };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
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
        [session.user.id, status, status, type, type === '2' ? 'tv' : 'movie', query.trim(), query.trim()]
    );

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
