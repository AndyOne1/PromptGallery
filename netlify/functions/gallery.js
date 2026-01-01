import { db } from './db';
import { galleryItems } from '../../src/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { verifyToken, headers } from './utils';

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const user = verifyToken(event);

    try {
        // GET: Fetch items
        if (event.httpMethod === 'GET') {
            const { visibility } = event.queryStringParameters || {};

            let items;
            if (visibility === 'public') {
                items = await db.select().from(galleryItems).where(eq(galleryItems.isPublic, true));
            } else {
                // Private items for the logged in user
                if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
                items = await db.select().from(galleryItems).where(eq(galleryItems.userId, user.userId));
            }

            return { statusCode: 200, headers, body: JSON.stringify(items) };
        }

        // POST: Add item
        if (event.httpMethod === 'POST') {
            if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

            const body = JSON.parse(event.body);
            const [newItem] = await db.insert(galleryItems).values({
                userId: user.userId,
                url: body.url,
                prompt: body.prompt,
                description: body.description,
                tags: body.tags || [],
                isPublic: !!body.isPublic
            }).returning();

            return { statusCode: 201, headers, body: JSON.stringify(newItem) };
        }

        // DELETE: Remove item
        if (event.httpMethod === 'DELETE') {
            if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

            const { id } = event.queryStringParameters || {};
            if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };

            // Ensure ownership
            const result = await db.delete(galleryItems)
                .where(
                    and(
                        eq(galleryItems.id, parseInt(id)),
                        eq(galleryItems.userId, user.userId)
                    )
                ).returning();

            if (result.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found or unauthorized' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        // PATCH: Toggle public
        if (event.httpMethod === 'PATCH') {
            if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

            const body = JSON.parse(event.body);
            const { id, isPublic } = body;

            const result = await db.update(galleryItems)
                .set({ isPublic })
                .where(
                    and(
                        eq(galleryItems.id, parseInt(id)),
                        eq(galleryItems.userId, user.userId)
                    )
                ).returning();

            if (result.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found or unauthorized' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    } catch (error) {
        console.error('Gallery API Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
