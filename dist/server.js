"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Initialize Supabase client
const supabaseUrl = 'https://ivfqjxsxbbcyuxvbelwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZnFqeHN4YmJjeXV4dmJlbHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk1MzkyNDUsImV4cCI6MjAzNTExNTI0NX0.RV1r5zzmiuux0BfOTHeyyYl0Fr6HH_OkO9hsCnCdWzs';
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Register a new user
function registerUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Hash the password
            const hashedPassword = yield hashPassword(password);
            // Insert user into Supabase
            const { data, error } = yield supabase.from('users').insert([{ email, password: hashedPassword }]);
            if (error) {
                console.error('Error registering user:', error.message);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Error registering user:', error instanceof Error ? error.message : String(error));
            return null;
        }
    });
}
// Authenticate user login
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Retrieve user by email
            const { data: users, error } = yield supabase.from('users').select('*').eq('email', email);
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
            const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!passwordMatch) {
                console.error('Invalid password');
                return null;
            }
            return user;
        }
        catch (error) {
            console.error('Error logging in user:', error instanceof Error ? error.message : String(error));
            return null;
        }
    });
}
// Reset user password
function resetPassword(email, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Hash the new password
            const hashedPassword = yield hashPassword(newPassword);
            // Update user's password in Supabase
            const { error } = yield supabase.from('users').update({ password: hashedPassword }).eq('email', email);
            if (error) {
                console.error('Error resetting password:', error.message);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error resetting password:', error instanceof Error ? error.message : String(error));
            return false;
        }
    });
}
// Utility function to hash password
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.hash(password, 10);
    });
}
