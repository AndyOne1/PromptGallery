import { getDb } from './db.js';
import { galleryItems } from './schema.js';
import { eq, and, or } from 'drizzle-orm';
import { verifyToken, headers } from './utils.js';
import axios from 'axios';

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const user = verifyToken(event);
    const db = getDb();

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

        // POST: Add item(s)
        if (event.httpMethod === 'POST') {
            if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

            const body = JSON.parse(event.body);

            // Handle batch upload
            if (Array.isArray(body)) {
                const insertedItems = [];
                for (const item of body) {
                    const existing = await db.select().from(galleryItems)
                        .where(and(
                            eq(galleryItems.userId, user.userId),
                            eq(galleryItems.url, item.url)
                        )).limit(1);

                    if (existing.length > 0) {
                        insertedItems.push(existing[0]);
                    } else {
                        const [newItem] = await db.insert(galleryItems).values({
                            userId: user.userId,
                            url: item.url,
                            publicId: item.publicId,
                            prompt: item.prompt,
                            title: item.title,
                            description: item.description,
                            tags: item.tags || [],
                            isPublic: !!item.isPublic
                        }).returning();
                        insertedItems.push(newItem);
                    }
                }
                return { statusCode: 201, headers, body: JSON.stringify(insertedItems) };
            }

            // Handle single upload (legacy support)
            const existing = await db.select().from(galleryItems)
                .where(and(
                    eq(galleryItems.userId, user.userId),
                    eq(galleryItems.url, body.url)
                )).limit(1);

            if (existing.length > 0) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(existing[0])
                };
            }

            const [newItem] = await db.insert(galleryItems).values({
                userId: user.userId,
                url: body.url,
                publicId: body.publicId,
                prompt: body.prompt,
                title: body.title,
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

            const deletedItem = result[0];

            // Delete from Cloudinary if publicId exists
            if (deletedItem.publicId) {
                const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
                const apiKey = process.env.CLOUDINARY_API_KEY;
                const apiSecret = process.env.CLOUDINARY_API_SECRET;

                if (cloudName && apiKey && apiSecret) {
                    try {
                        const timestamp = Math.round((new Date()).getTime() / 1000);
                        const signatureData = `public_id=${deletedItem.publicId}&timestamp=${timestamp}${apiSecret}`;
                        const crypto = await import('crypto');
                        const signature = crypto.createHash('sha1').update(signatureData).digest('hex');

                        const formData = new URLSearchParams();
                        formData.append('public_id', deletedItem.publicId);
                        formData.append('timestamp', timestamp);
                        formData.append('api_key', apiKey);
                        formData.append('signature', signature);

                        await axios.post(
                            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
                            formData.toString()
                        );
                    } catch (err) {
                        console.error('Cloudinary Deletion Error:', err);
                        // We don't fail the whole request if Cloudinary fails, but we log it
                    }
                }
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
