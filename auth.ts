// auth.ts
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ivfqjxsxbbcyuxvbelwb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnFqeHN4YmJjeXV4dmJlbHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk3OTcxNDIsImV4cCI6MjAzNTM3MzE0Mn0.-Yll2FQgSfkG5YsR9r4zG467T0tl-9st8SB7bk4MlDk';
const supabase = createClient(supabaseUrl, supabaseKey);

// Authenticate user login using Supabase
export async function loginUser(username: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });
        if (error) {
            console.error('Supabase signInWithPassword error:', error);
            throw new Error(error.message);
        }
        return data.user;
    } catch (error) {
        console.error('Error in loginUser:', error);
        throw error;
    }
}

// Generate JWT token
export function generateToken(user: any): string {
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    return jwt.sign({ id: user.id }, secret, { expiresIn: '80h' });
}