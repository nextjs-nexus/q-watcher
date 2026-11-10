import './load-env';
import { getDemoConfig } from './demo';
import { pool } from './db';
import { resetDemoAccount } from './demo-account';

async function resetDemo() {
  const config = getDemoConfig();
  if (!config) {
    throw new Error('Set DEMO_USER_EMAIL and DEMO_USER_PASSWORD before running demo:reset. Run db:migrate first.');
  }

  await resetDemoAccount(config);
  console.log(`Demo account reset at ${new Date().toISOString()}.`);
}

resetDemo().catch((error: unknown) => {
  console.error('Demo reset failed:', error);
  process.exitCode = 1;
}).finally(() => pool.promise().end());
