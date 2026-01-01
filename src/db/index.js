import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const getConnection = () => {
    const url = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not defined in environment variables');
    }
    return url;
};

const sql = neon(getConnection());
export const db = drizzle(sql, { schema });
