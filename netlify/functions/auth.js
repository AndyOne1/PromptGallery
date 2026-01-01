import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const handler = async (event) => {
    console.log('--- AUTH FUNCTION START ---');
    console.log('Method:', event.httpMethod);

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { action, email, password, name } = body;
        console.log('Action:', action, 'Email:', email);

        console.log('Initializing DB connection...');
        const db = getDb();
        console.log('DB initialized');

        if (action === 'signup') {
            console.log('Starting SIGNUP flow...');
            if (!email || !password) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) };
            }

            // Check if user exists
            console.log('Checking if user exists...');
            const existingUser = await db.select().from(users).where(eq(users.email, email));
            console.log('Existing user check done, found:', existingUser.length);

            if (existingUser.length > 0) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'User already exists' }) };
            }

            // Hash password
            console.log('Hashing password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Password hashed');

            // Create user
            console.log('Inserting into DB...');
            const [newUser] = await db.insert(users).values({
                email,
                password: hashedPassword,
                name
            }).returning();
            console.log('User created with ID:', newUser.id);

            // Create token
            console.log('Signing JWT...');
            const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            console.log('JWT signed');

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
            console.log('Starting LOGIN flow...');
            if (!email || !password) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) };
            }

            // Find user
            console.log('Finding user...');
            const [user] = await db.select().from(users).where(eq(users.email, email));
            console.log('User found:', !!user);

            if (!user) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };
            }

            // Check password
            console.log('Comparing passwords...');
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', isMatch);

            if (!isMatch) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid credentials' }) };
            }

            // Create token
            console.log('Signing JWT...');
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
            console.log('JWT signed');

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
        console.error('CRITICAL AUTH ERROR:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
