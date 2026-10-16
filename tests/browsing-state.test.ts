import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getListUrl, readBrowsingState, saveBrowsingState } from '../lib/browsing-state';
import type { Movie } from '../lib/tmdb';

test('return links retain filters and reject destinations outside the list', () => {
    const url = '/list?genre=18&type=2&query=hello%20world&status=watched';
    assert.equal(getListUrl(url), url);
    assert.equal(getListUrl('/?type=2'), '/list?type=2');
    assert.equal(getListUrl('/'), '/list');
    for (const value of [null, 'https://example.com', '//example.com', '/movie/42', 'javascript:alert(1)']) {
        assert.equal(getListUrl(value), '/list');
    }
});

test('a saved list retains loaded pages and scroll, and never applies to another filter', () => {
    const state = {
        url: '/list?genre=18&type=2',
        movies: [{ id: 42, title: 'Saved show', media_type: 'tv' }] as Movie[],
        page: 4,
        hasMore: true,
        scrollY: 2400,
    };
    // Browser storage can be unavailable; returning in the same tab must still work.
    saveBrowsingState(state);
    assert.deepEqual(readBrowsingState(state.url), state);
    assert.equal(readBrowsingState('/list?genre=35&type=1'), null);
});

test('saved watch marks and ratings update without losing loaded pages or scroll', async () => {
    const { updateSavedMediaPreference } = await import('../lib/browsing-state');
    const state = {
        url: '/list?type=0',
        movies: [
            { id: 42, title: 'Movie', media_type: 'movie' },
            { id: 42, title: 'Show', media_type: 'tv' },
        ] as Movie[],
        page: 3,
        hasMore: true,
        scrollY: 1800,
    };
    saveBrowsingState(state);
    updateSavedMediaPreference('movie', 42, { toWatch: true, watched: true, userRating: 8 });
    const restored = readBrowsingState(state.url)!;
    assert.equal(restored.movies[0].to_watch, true);
    assert.equal(restored.movies[0].watched, true);
    assert.equal(restored.movies[0].user_rating, 8);
    assert.equal(restored.movies[1].watched, undefined);
    assert.equal(restored.page, 3);
    assert.equal(restored.scrollY, 1800);
    updateSavedMediaPreference('movie', 42, { toWatch: false, watched: false, userRating: null });
    assert.equal(readBrowsingState(state.url)!.movies[0].watched, false);
});
