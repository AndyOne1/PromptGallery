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
    publicId: text('public_id'),
    prompt: text('prompt').notNull(),
    title: text('title'),
    description: text('description'),
    tags: jsonb('tags').$type().notNull(),
    isPublic: boolean('is_public').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const savedPrompts = pgTable('saved_prompts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    title: text('title'),
    content: text('content').notNull(),
    refinedTags: jsonb('refined_tags').$type().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const characters = pgTable('characters', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    attributes: jsonb('attributes').$type().notNull(),
    prompt: text('prompt'),
    pinnedImageId: integer('pinned_image_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const characterImages = pgTable('character_images', {
    id: serial('id').primaryKey(),
    characterId: integer('character_id').references(() => characters.id).notNull(),
    imageId: integer('image_id').references(() => galleryItems.id).notNull(),
    isPinned: boolean('is_pinned').default(false).notNull(),
});
