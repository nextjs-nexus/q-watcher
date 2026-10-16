import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Opt in against the local database: RUN_DATABASE_TESTS=1 npm test
// All writes run on one connection and are rolled back.
test('MariaDB supports auth reads and watchlist insert/update/filter queries', {
  skip: process.env.RUN_DATABASE_TESTS !== '1',
}, async () => {
  await import('../lib/load-env');
  const { pool } = await import('../lib/db');
  const { auth } = await import('../lib/auth');
  const connection = await pool.promise().getConnection();

  try {
    const context = await auth.$context;
    const user = await context.adapter.findOne<{ id: string; emailVerified: boolean }>({
      model: 'user',
      where: [{ field: 'emailVerified', value: true }],
    });
    assert.ok(user, 'An existing verified user is required for this integration check.');
    assert.equal(typeof user.emailVerified, 'boolean');

    await connection.beginTransaction();
    const tmdbId = 2147483647;
    await connection.query(
      'DELETE FROM user_media_preferences WHERE user_id = ? AND tmdb_id = ?',
      [user.id, tmdbId]
    );
    const action = await readFile(new URL('../actions/media-preferences.ts', import.meta.url), 'utf8');
    const upsert = action.match(/`(INSERT INTO user_media_preferences[\s\S]*?)`/)?.[1];
    assert.ok(upsert);
    const values = [user.id, tmdbId, 'movie', 'Database integration probe', null, null, true, false, 7];
    await connection.query(upsert, values);
    await connection.query(upsert, [...values.slice(0, 6), false, true, 9]);

    const preferences = await readFile(new URL('../lib/media-preferences.ts', import.meta.url), 'utf8');
    const singleQuery = preferences.match(/`(SELECT to_watch[\s\S]*?)`/)?.[1];
    assert.ok(singleQuery);
    const [single] = await connection.query(singleQuery, [user.id, tmdbId, 'movie']);
    assert.deepEqual(JSON.parse(JSON.stringify(single)), [{ to_watch: false, watched: true, user_rating: 9 }]);

    const batchQuery = preferences.match(/`(SELECT preferences.media_type[\s\S]*?)`/)?.[1];
    assert.ok(batchQuery);
    const [batch] = await connection.query(batchQuery.replace('${requestedTitles}', '(?, ?), (?, ?)'), [
      user.id, 'movie', tmdbId, 'tv', tmdbId,
    ]);
    assert.ok(Array.isArray(batch));
    assert.equal(batch.length, 1);

    const list = await readFile(new URL('../lib/list-movies.ts', import.meta.url), 'utf8');
    const listQuery = list.match(/`(SELECT tmdb_id[\s\S]*?)`/)?.[1];
    assert.ok(listQuery);
    const [rows] = await connection.query(listQuery, [
      user.id, 'watched', 'watched', '1', 'movie', 'Database integration probe', 'Database integration probe',
    ]);
    assert.ok(Array.isArray(rows));
    assert.equal(rows.length, 1);
  } finally {
    await connection.rollback();
    connection.release();
    await pool.promise().end();
  }
});
