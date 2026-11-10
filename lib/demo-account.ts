import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from './db';
import { DEMO_TITLES, isDemoResetDue, type DemoConfig } from './demo';

const DEMO_USER_NAME = 'Demo Visitor';

async function upsertDemoUser(connection: PoolConnection, email: string): Promise<string> {
  // INSERT IGNORE keeps two simultaneous first resets from failing on the unique email key.
  await connection.query(
    'INSERT IGNORE INTO `user` (id, email, `emailVerified`, name) VALUES (?, ?, ?, ?)',
    [randomUUID(), email, true, DEMO_USER_NAME]
  );

  const [users] = await connection.query<RowDataPacket[]>(
    'SELECT id FROM `user` WHERE email = ?',
    [email]
  );
  const userId = users[0]?.id;
  if (typeof userId !== 'string') {
    throw new Error('The demo user could not be created.');
  }

  await connection.query(
    'UPDATE `user` SET name = ?, `emailVerified` = ?, image = NULL, `updatedAt` = NOW(6) WHERE id = ?',
    [DEMO_USER_NAME, true, userId]
  );

  return userId;
}

async function upsertDemoPassword(connection: PoolConnection, userId: string, passwordHash: string): Promise<void> {
  const [accounts] = await connection.query<RowDataPacket[]>(
    'SELECT id FROM account WHERE `userId` = ? AND `providerId` = ?',
    [userId, 'credential']
  );

  if (accounts.length > 0) {
    await connection.query(
      'UPDATE account SET password = ?, `updatedAt` = NOW(6) WHERE `userId` = ? AND `providerId` = ?',
      [passwordHash, userId, 'credential']
    );
    return;
  }

  await connection.query(
    'INSERT INTO account (id, `accountId`, `providerId`, `userId`, password) VALUES (?, ?, ?, ?, ?)',
    [randomUUID(), userId, 'credential', userId, passwordHash]
  );
}

async function restoreDemoTitles(connection: PoolConnection, userId: string): Promise<void> {
  await connection.query('DELETE FROM user_media_preferences WHERE user_id = ?', [userId]);

  for (const [index, title] of DEMO_TITLES.entries()) {
    // Stagger timestamps so saved lists show the sample titles in a stable order.
    await connection.query(
      `INSERT INTO user_media_preferences (
         user_id,
         tmdb_id,
         media_type,
         title,
         poster_path,
         release_date,
         to_watch,
         watched,
         user_rating,
         created_at,
         updated_at
       )
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, NOW(6) - INTERVAL ? MINUTE, NOW(6) - INTERVAL ? MINUTE)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         to_watch = VALUES(to_watch),
         watched = VALUES(watched),
         user_rating = VALUES(user_rating),
         created_at = VALUES(created_at),
         updated_at = VALUES(updated_at)`,
      [
        userId,
        title.tmdbId,
        title.mediaType,
        title.title,
        title.toWatch,
        title.watched,
        title.userRating,
        index,
        index,
      ]
    );
  }
}

/**
 * Creates the shared demo account if needed and restores its password and sample lists.
 */
export async function resetDemoAccount(config: DemoConfig): Promise<void> {
  const passwordHash = await hashPassword(config.password);
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    const userId = await upsertDemoUser(connection, config.email);
    await upsertDemoPassword(connection, userId, passwordHash);
    await restoreDemoTitles(connection, userId);
    await connection.query(
      'DELETE FROM `session` WHERE `userId` = ? AND `expiresAt` < NOW(6)',
      [userId]
    );
    await connection.query(
      `INSERT INTO demo_account_resets (id, reset_at)
       VALUES (1, NOW(6))
       ON DUPLICATE KEY UPDATE reset_at = VALUES(reset_at)`
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Resets the demo account when it does not exist yet or its last reset is older than a day.
 * This keeps the demo usable even when the host has no scheduled jobs.
 */
export async function ensureFreshDemoAccount(config: DemoConfig): Promise<void> {
  const [rows] = await pool.promise().query<RowDataPacket[]>(
    `SELECT TIMESTAMPDIFF(SECOND, resets.reset_at, NOW(6)) AS seconds_since_reset
     FROM \`user\` AS users
     LEFT JOIN demo_account_resets AS resets ON resets.id = 1
     WHERE users.email = ?`,
    [config.email]
  );

  if (rows.length === 0) {
    await resetDemoAccount(config);
    return;
  }

  if (isDemoResetDue(rows[0].seconds_since_reset)) {
    await resetDemoAccount(config);
  }
}
