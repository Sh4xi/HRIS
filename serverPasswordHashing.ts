import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ivfqjxsxbbcyuxvbelwb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnFqeHN4YmJjeXV4dmJlbHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1MzkyNDUsImV4cCI6MjAzNTExNTI0NX0.RV1r5zzmiuux0BfOTHeyyYl0Fr6HH_OkO9hsCnCdWzs';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// Utility function to hash password
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Register a new user
async function registerUser(username: string, password: string): Promise<any | null> {
    try {
        const hashedPassword = await hashPassword(password);
        const { data, error } = await supabase
            .from('users')
            .insert([{ username, password: hashedPassword }])
            .select()
            .single();

        if (error) {
            console.error('Error registering user:', error.message);
            if (error.message.includes('duplicate key value violates unique constraint')) {
                throw new Error('Username already exists');
            }
            return null;
        }
        return data;
    } catch (error) {
        console.error('Error registering user:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}

// Authenticate user login
async function loginUser(username: string, password: string): Promise<any | null> {
    try {
        console.log(`Attempting to find user: ${username}`);
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return null;
        }

        if (!user) {
            console.log('User not found');
            return null;
        }

        console.log('User found, comparing passwords');
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log('Password does not match');
            return null;
        }

        console.log('Login successful');
        return user;
    } catch (error) {
        console.error('Error in loginUser:', error);
        return null;
    }
}

// Generate JWT token
function generateToken(user: any): string {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
}

// Login endpoint
app.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body as { username: string, password: string };
    try {
        console.log(`Attempting login for username: ${username}`);

        const user = await loginUser(username, password);
        if (user) {
            const token = generateToken(user);
            console.log('Login successful, token generated');
            res.json({ token });
        } else {
            console.error(`Login failed for username: ${username}`);
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register endpoint
app.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body as { username: string, password: string };
    try {
        // Check if username already exists
        const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Register new user
        const user = await registerUser(username, password);
        if (user) {
            const token = generateToken(user);
            console.log('Registration successful, token generated');
            res.status(201).json({ message: 'User registered successfully', token });
        } else {
            throw new Error('User registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error && error.message === 'Username already exists') {
            res.status(409).json({ message: 'Username already exists' });
        } else {
            res.status(400).json({ message: error instanceof Error ? error.message : 'Registration failed' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});