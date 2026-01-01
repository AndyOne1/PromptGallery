import { neon } from '@netlify/neon';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const getSqlUrl = () => {
    const url = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not defined');
    }
    return url;
};

const sql = neon(getSqlUrl());
export const db = drizzle(sql, { schema });
export { schema };
