import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db';
import { users } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { action, email, password, name } = JSON.parse(event.body);

        if (action === 'signup') {
            if (!email || !password) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) };
            }

            // Check if user exists
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            if (existingUser.length > 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'User already exists' }) };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const [newUser] = await db.insert(users).values({
                email,
                password: hashedPassword,
                name
            }).returning();

            // Create token
            const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    token,
                    user: { id: newUser.id, email: newUser.email, name: newUser.name }
                })
            };
        }

        if (action === 'login') {
            if (!email || !password) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) };
            }

            // Find user
            const [user] = await db.select().from(users).where(eq(users.email, email));
            if (!user) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };
            }

            // Create token
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    token,
                    user: { id: user.id, email: user.email, name: user.name }
                })
            };
        }

        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };

    } catch (error) {
        console.error('Auth Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
