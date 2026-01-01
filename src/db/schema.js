import { pgTable, serial, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const galleryItems = pgTable('gallery_items', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    url: text('url').notNull(),
    prompt: text('prompt').notNull(),
    description: text('description'),
    tags: jsonb('tags').$type().notNull(), // Array of strings
    isPublic: boolean('is_public').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const savedPrompts = pgTable('saved_prompts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    refinedTags: jsonb('refined_tags').$type().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
