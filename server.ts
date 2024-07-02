import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loginUser, generateToken } from './auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
        res.status(500).json({ message: 'Internal server error', error});
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
