import { getDb } from './db.js';
import { characters, characterImages, galleryItems, users } from './schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken, headers } from './utils.js';

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const user = verifyToken(event);
    if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

    const db = getDb();
    const path = event.path.replace('/.netlify/functions/characters', '');
    const segments = path.split('/').filter(Boolean);

    try {
        // GET /characters - List all characters
        if (event.httpMethod === 'GET' && segments.length === 0) {
            const items = await db.select({
                id: characters.id,
                userId: characters.userId,
                name: characters.name,
                attributes: characters.attributes,
                prompt: characters.prompt,
                pinnedImageId: characters.pinnedImageId,
                createdAt: characters.createdAt,
                updatedAt: characters.updatedAt,
                userName: users.name
            })
                .from(characters)
                .leftJoin(users, eq(characters.userId, users.id))
                .where(eq(characters.userId, user.userId))
                .orderBy(desc(characters.createdAt));

            // Get pinned images for each character
            const result = await Promise.all(items.map(async (char) => {
                let pinnedImage = null;
                if (char.pinnedImageId) {
                    const [img] = await db.select()
                        .from(galleryItems)
                        .where(eq(galleryItems.id, char.pinnedImageId));
                    pinnedImage = img || null;
                }
                return { ...char, pinnedImage };
            }));

            return { statusCode: 200, headers, body: JSON.stringify(result) };
        }

        // GET /characters/:id - Get single character with images
        if (event.httpMethod === 'GET' && segments.length === 1) {
            const characterId = parseInt(segments[0]);
            const [character] = await db.select({
                id: characters.id,
                userId: characters.userId,
                name: characters.name,
                attributes: characters.attributes,
                prompt: characters.prompt,
                pinnedImageId: characters.pinnedImageId,
                createdAt: characters.createdAt,
                updatedAt: characters.updatedAt,
                userName: users.name
            })
                .from(characters)
                .leftJoin(users, eq(characters.userId, users.id))
                .where(and(
                    eq(characters.id, characterId),
                    eq(characters.userId, user.userId)
                ));

            if (!character) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Character not found' }) };
            }

            // Get linked images
            const linkedImages = await db.select({
                id: characterImages.id,
                imageId: characterImages.imageId,
                isPinned: characterImages.isPinned,
                url: galleryItems.url,
                prompt: galleryItems.prompt,
            })
                .from(characterImages)
                .leftJoin(galleryItems, eq(characterImages.imageId, galleryItems.id))
                .where(eq(characterImages.characterId, characterId));

            return { statusCode: 200, headers, body: JSON.stringify({ ...character, images: linkedImages }) };
        }

        // POST /characters - Create new character
        if (event.httpMethod === 'POST' && segments.length === 0) {
            const body = JSON.parse(event.body);
            const [newChar] = await db.insert(characters).values({
                userId: user.userId,
                name: body.name,
                attributes: body.attributes,
                prompt: body.prompt || null,
            }).returning();

            return { statusCode: 201, headers, body: JSON.stringify(newChar) };
        }

        // PUT /characters/:id - Update character
        if (event.httpMethod === 'PUT' && segments.length === 1) {
            const characterId = parseInt(segments[0]);
            const body = JSON.parse(event.body);

            const [updated] = await db.update(characters)
                .set({
                    name: body.name,
                    attributes: body.attributes,
                    prompt: body.prompt,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(characters.id, characterId),
                    eq(characters.userId, user.userId)
                ))
                .returning();

            if (!updated) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Character not found' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify(updated) };
        }

        // DELETE /characters/:id - Delete character
        if (event.httpMethod === 'DELETE' && segments.length === 1) {
            const characterId = parseInt(segments[0]);

            // Delete linked images first
            await db.delete(characterImages).where(eq(characterImages.characterId, characterId));

            const result = await db.delete(characters)
                .where(and(
                    eq(characters.id, characterId),
                    eq(characters.userId, user.userId)
                ))
                .returning();

            if (result.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Character not found' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        // POST /characters/:id/images - Link image to character
        if (event.httpMethod === 'POST' && segments.length === 2 && segments[1] === 'images') {
            const characterId = parseInt(segments[0]);
            const body = JSON.parse(event.body);

            const [link] = await db.insert(characterImages).values({
                characterId,
                imageId: body.imageId,
                isPinned: false,
            }).returning();

            return { statusCode: 201, headers, body: JSON.stringify(link) };
        }

        // PUT /characters/:id/pin/:imageId - Set pinned image
        if (event.httpMethod === 'PUT' && segments.length === 3 && segments[1] === 'pin') {
            const characterId = parseInt(segments[0]);
            const imageId = parseInt(segments[2]);

            // Unpin all images for this character
            await db.update(characterImages)
                .set({ isPinned: false })
                .where(eq(characterImages.characterId, characterId));

            // Pin the selected image
            await db.update(characterImages)
                .set({ isPinned: true })
                .where(and(
                    eq(characterImages.characterId, characterId),
                    eq(characterImages.imageId, imageId)
                ));

            // Update character's pinnedImageId
            const [updated] = await db.update(characters)
                .set({ pinnedImageId: imageId, updatedAt: new Date() })
                .where(and(
                    eq(characters.id, characterId),
                    eq(characters.userId, user.userId)
                ))
                .returning();

            return { statusCode: 200, headers, body: JSON.stringify(updated) };
        }

        // DELETE /characters/:id/images/:imageId - Unlink image
        if (event.httpMethod === 'DELETE' && segments.length === 3 && segments[1] === 'images') {
            const characterId = parseInt(segments[0]);
            const imageId = parseInt(segments[2]);

            await db.delete(characterImages)
                .where(and(
                    eq(characterImages.characterId, characterId),
                    eq(characterImages.imageId, imageId)
                ));

            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    } catch (error) {
        console.error('Characters API Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
