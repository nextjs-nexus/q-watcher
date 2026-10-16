import assert from 'node:assert/strict';
import { before, test } from 'node:test';

process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-key';
let fetchMovies: typeof import('../lib/tmdb').fetchMovies;
let getMediaTrailers: typeof import('../lib/tmdb').getMediaTrailers;
before(async () => {
    ({ fetchMovies, getMediaTrailers } = await import('../lib/tmdb'));
});
const requests: URL[] = [];

globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    requests.push(url);
    if (url.pathname.endsWith('/videos')) {
        if (url.pathname.includes('/unavailable/')) return new Response(null, { status: 503 });
        const trailer = { id: '1', key: 'abcdefghijk', name: 'Trailer', site: 'YouTube', type: 'Trailer', official: false };
        return Response.json({ results: [
            trailer,
            { ...trailer, id: '2', key: '12345678901', official: true },
            { ...trailer, id: '3' },
            { ...trailer, id: '4', key: 'abcdefghij2', site: 'Vimeo' },
            { ...trailer, id: '5', key: 'abcdefghij3', type: 'Clip' },
            { ...trailer, id: '6', key: '' },
        ] });
    }
    const isTV = url.pathname.includes('/tv');
    const item = isTV
        ? { id: 42, name: 'Test Show', first_air_date: '2020-01-01', vote_average: 9 }
        : { id: 42, title: 'Test Movie', release_date: '2021-01-01', vote_average: 8 };
    const results = url.pathname.endsWith('/multi')
        ? [{ ...item, media_type: 'movie' }, { id: 99, name: 'Show', media_type: 'tv' }, { id: 1, media_type: 'person' }]
        : [item];
    return Response.json({ results, page: Number(url.searchParams.get('page')), total_pages: isTV ? 3 : 5, total_results: 100 });
};

test('default browsing matches the Movies selector', async () => {
    requests.length = 0;
    const result = await fetchMovies();
    assert.equal(requests[0].pathname, '/3/movie/top_rated');
    assert.equal(result.movies[0].media_type, 'movie');
});

test('trailers use movie and TV endpoints, filter and deduplicate YouTube trailers, and prioritize official videos', async () => {
    for (const mediaType of ['movie', 'tv'] as const) {
        requests.length = 0;
        const trailers = await getMediaTrailers('42', mediaType);
        assert.equal(requests[0].pathname, `/3/${mediaType}/42/videos`);
        assert.equal(requests[0].searchParams.get('api_key'), 'test-key');
        assert.deepEqual(trailers.map((video) => video.key), ['12345678901', 'abcdefghijk']);
    }
});

test('unavailable trailers do not break the detail page', async () => {
    assert.deepEqual(await getMediaTrailers('unavailable', 'movie'), []);
});

test('TV browsing uses TV results and normalizes card fields', async () => {
    requests.length = 0;
    const result = await fetchMovies({ type: '2', page: 2 });
    assert.equal(requests[0].pathname, '/3/tv/top_rated');
    assert.equal(requests[0].searchParams.get('page'), '2');
    assert.equal(result.movies[0].media_type, 'tv');
    assert.equal(result.movies[0].title, 'Test Show');
    assert.equal(result.movies[0].release_date, '2020-01-01');
});

test('combined browsing keeps movies and TV with overlapping IDs and pagination', async () => {
    requests.length = 0;
    const result = await fetchMovies({ type: '0', page: 2 });
    assert.deepEqual(requests.map((url) => url.pathname).sort(), ['/3/movie/top_rated', '/3/tv/top_rated']);
    assert.deepEqual(result.movies.map((item) => item.media_type), ['tv', 'movie']);
    assert.equal(result.totalPages, 5);
    assert.equal(result.totalResults, 200);
    assert.equal(result.page, 2);
});

test('search honors all three types and excludes people from combined results', async () => {
    for (const [type, endpoint] of [['1', 'movie'], ['2', 'tv'], ['0', 'multi']]) {
        requests.length = 0;
        const result = await fetchMovies({ type, query: ' hello ', page: 2 });
        assert.equal(requests[0].pathname, `/3/search/${endpoint}`);
        assert.equal(requests[0].searchParams.get('query'), 'hello');
        assert.ok(result.movies.every((item) => item.media_type === 'movie' || item.media_type === 'tv'));
        assert.equal(result.movies.length, type === '0' ? 2 : 1);
    }
});

test('genre browsing honors TV and combined selections', async () => {
    requests.length = 0;
    await fetchMovies({ type: '2', genre: '28' });
    assert.equal(requests[0].pathname, '/3/discover/tv');
    assert.equal(requests[0].searchParams.get('with_genres'), '10759');
    requests.length = 0;
    const result = await fetchMovies({ type: '0', genre: '18' });
    assert.deepEqual(requests.map((url) => url.pathname).sort(), ['/3/discover/movie', '/3/discover/tv']);
    assert.equal(result.movies.length, 2);
});


test('genre browsing requests highest ratings first on initial and subsequent pages', async () => {
    for (const type of ['1', '2', '0']) {
        for (const page of [1, 2]) {
            requests.length = 0;
            await fetchMovies({ type, genre: '18', page });
            assert.equal(requests.length, type === '0' ? 2 : 1);
            for (const url of requests) {
                assert.equal(url.searchParams.get('sort_by'), 'vote_average.desc');
                assert.equal(url.searchParams.get('with_genres'), '18');
                assert.equal(url.searchParams.get('page'), String(page));
            }
        }
    }
});
