import './load-env';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { db } from './db';

async function migrate() {
  try {
    const directory = resolve(process.cwd(), 'db/migrations');
    const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();

    for (const file of files) {
      const migration = await readFile(resolve(directory, file), 'utf8');
      for (const statement of migration.split(';').map((sql) => sql.trim()).filter(Boolean)) {
        await db.query(statement);
      }
      console.log(`Migration completed: ${file}`);
    }
  } finally {
    await db.end();
  }
}

migrate().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
