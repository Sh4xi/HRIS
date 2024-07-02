import { createClient, PostgrestError } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Initialize Supabase client
const supabaseUrl = 'https://ivfqjxsxbbcyuxvbelwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnFqeHN4YmJjeXV4dmJlbHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1MzkyNDUsImV4cCI6MjAzNTExNTI0NX0.RV1r5zzmiuux0BfOTHeyyYl0Fr6HH_OkO9hsCnCdWzs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Register a new user
async function registerUser(email: string, password: string) {
    try {
        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Insert user into Supabase
        const { data, error } = await supabase.from('users').insert([{ email, password: hashedPassword }]);
        if (error) {
            console.error('Error registering user:', error.message);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Error registering user:', error instanceof Error ? error.message : String(error));
        return null;
    }
}

// Authenticate user login
async function loginUser(email: string, password: string) {
    try {
        // Retrieve user by email
        const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
        if (error) {
            console.error('Error logging in user:', error.message);
            return null;
        }
        
        // Check if user exists
        if (!users || users.length === 0) {
            console.error('User not found');
            return null;
        }
        
        // Compare hashed password
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.error('Invalid password');
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Error logging in user:', error instanceof Error ? error.message : String(error));
        return null;
    }
}

// Reset user password
async function resetPassword(email: string, newPassword: string) {
    try {
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user's password in Supabase
        const { error } = await supabase.from('users').update({ password: hashedPassword }).eq('email', email);
        if (error) {
            console.error('Error resetting password:', error.message);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error resetting password:', error instanceof Error ? error.message : String(error));
        return false;
    }
}

// Utility function to hash password
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}