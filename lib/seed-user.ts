import './load-env';
import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { pool } from './db';

async function seedDefaultUser() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;
  if (!email || !password) {
    throw new Error('Set SEED_USER_EMAIL and SEED_USER_PASSWORD before running db:seed. Run db:migrate first.');
  }

  const connection = await pool.promise().getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query('SELECT id FROM `user` WHERE email = ?', [email]);
    if (Array.isArray(users) && users.length > 0) {
      console.log('Seed user already exists.');
      await connection.rollback();
      return;
    }

    const userId = randomUUID();
    await connection.query(
      'INSERT INTO `user` (id, email, `emailVerified`, name) VALUES (?, ?, ?, ?)',
      [userId, email, true, 'Default User']
    );
    await connection.query(
      'INSERT INTO account (id, `accountId`, `providerId`, `userId`, password) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), userId, 'credential', userId, await hashPassword(password)]
    );
    await connection.commit();
    console.log('Seed user created.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

seedDefaultUser().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
}).finally(() => pool.promise().end());
