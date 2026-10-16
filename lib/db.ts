import { createPool, type Pool, type RowDataPacket } from 'mysql2';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must point to the MariaDB database.');
}

const globalForDatabase = globalThis as typeof globalThis & {
  qWatcherMariaDBPool?: Pool;
};

export const pool =
  globalForDatabase.qWatcherMariaDBPool ||
  createPool({
    uri: connectionString,
    timezone: 'Z',
    charset: 'utf8mb4',
    typeCast(field, next) {
      if (field.type === 'TINY' && field.length === 1) {
        const value = field.string();
        return value === null ? null : value === '1';
      }
      return next();
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDatabase.qWatcherMariaDBPool = pool;
}

// Keep a single pool for application queries and Better Auth.
export const db = {
  async query<T = RowDataPacket>(statement: string, values: unknown[] = []) {
    const [result] = await pool.promise().query(statement, values);
    return { rows: (Array.isArray(result) ? result : []) as T[] };
  },
  async end() {
    await pool.promise().end();
  },
};
