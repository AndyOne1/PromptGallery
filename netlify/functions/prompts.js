import { getDb } from './db.js';
import { savedPrompts, users } from './schema.js';
import { eq, and } from 'drizzle-orm';
import { verifyToken, headers } from './utils.js';

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const user = verifyToken(event);
    if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };

    const db = getDb();

    try {
        // GET: Fetch user's saved prompts
        if (event.httpMethod === 'GET') {
            const items = await db.select({
                id: savedPrompts.id,
                userId: savedPrompts.userId,
                title: savedPrompts.title,
                content: savedPrompts.content,
                refinedTags: savedPrompts.refinedTags,
                createdAt: savedPrompts.createdAt,
                userName: users.name
            })
                .from(savedPrompts)
                .leftJoin(users, eq(savedPrompts.userId, users.id))
                .where(eq(savedPrompts.userId, user.userId));
            return { statusCode: 200, headers, body: JSON.stringify(items) };
        }

        // POST: Save a new prompt
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const [newItem] = await db.insert(savedPrompts).values({
                userId: user.userId,
                title: body.title,
                content: body.content,
                refinedTags: body.refinedTags || []
            }).returning();

            return { statusCode: 201, headers, body: JSON.stringify(newItem) };
        }

        // DELETE: Remove a prompt
        if (event.httpMethod === 'DELETE') {
            const { id } = event.queryStringParameters || {};
            if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };

            const result = await db.delete(savedPrompts)
                .where(
                    and(
                        eq(savedPrompts.id, parseInt(id)),
                        eq(savedPrompts.userId, user.userId)
                    )
                ).returning();

            if (result.length === 0) {
                return { statusCode: 404, headers, body: JSON.stringify({ error: 'Item not found or unauthorized' }) };
            }

            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

    } catch (error) {
        console.error('Prompts API Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
