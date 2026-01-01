import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// @netlify/neon automatically uses NETLIFY_DATABASE_URL from the Netlify environment
const sql = neon();
export const db = drizzle(sql, { schema });
export { schema };
