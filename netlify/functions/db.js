import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

let cachedDb = null;

export const getDb = () => {
    if (cachedDb) return cachedDb;

    const url = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not defined');
    }

    const sql = neon(url);
    cachedDb = drizzle(sql, { schema });
    return cachedDb;
};

export { schema };
