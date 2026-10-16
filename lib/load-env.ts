import { resolve } from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: resolve(process.cwd(), '.env.local'), quiet: true });
