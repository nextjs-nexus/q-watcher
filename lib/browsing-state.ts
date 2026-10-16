import type { Movie } from './tmdb';

export interface BrowsingState {
    url: string;
    movies: Movie[];
    page: number;
    hasMore: boolean;
    scrollY: number;
}

const storageKey = 'q-watcher:browsing-state:v1';
let memoryState: BrowsingState | null = null;

export function getListUrl(value: string | null): string {
    if (!value) return '/list';
    if (/^\/list(?:\?|$)/.test(value)) return value;
    if (/^\/(?:\?|$)/.test(value)) return '/list' + value.slice(1);
    return '/list';
}

export function saveBrowsingState(state: BrowsingState): void {
    memoryState = state;
    try {
        sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
        // In-memory restoration still works if browser storage is unavailable or full.
    }
}

export function readBrowsingState(url: string): BrowsingState | null {
    try {
        const state: BrowsingState | null = memoryState || JSON.parse(sessionStorage.getItem(storageKey) || 'null');
        if (state?.url === url && Array.isArray(state.movies)
            && Number.isInteger(state.page) && state.page >= 1
            && typeof state.hasMore === 'boolean'
            && Number.isFinite(state.scrollY) && state.scrollY >= 0) {
            return state;
        }
    } catch {
        // Treat unavailable or invalid storage as a fresh list visit.
    }
    return null;
}

export function updateSavedMediaPreference(
    mediaType: 'movie' | 'tv',
    tmdbId: number,
    preference: { toWatch: boolean; watched: boolean; userRating: number | null }
): void {
    try {
        const state: BrowsingState | null = memoryState || JSON.parse(sessionStorage.getItem(storageKey) || 'null');
        if (!state || !Array.isArray(state.movies)) return;
        saveBrowsingState({
            ...state,
            movies: state.movies.map((movie) => (
                movie.id === tmdbId && (movie.media_type || 'movie') === mediaType
                    ? { ...movie, to_watch: preference.toWatch, watched: preference.watched, user_rating: preference.userRating }
                    : movie
            )),
        });
    } catch {
        // A failed browser cache update must not undo a successful database save.
    }
}
