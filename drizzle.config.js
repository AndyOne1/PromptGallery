import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './netlify/functions/schema.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
    },
});
