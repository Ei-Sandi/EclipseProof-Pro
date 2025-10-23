import express from 'express';
import { UserAccount } from '../services/UserAccount';

export const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        const userAccount = new UserAccount();
        await userAccount.signUp(email, password);
        return res.status(201).json({ message: 'User successfully registered and wallet created.' });
    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred during signup.'
        });
    }

});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        const userAccount = new UserAccount();
        await userAccount.login(email, password);
        return res.status(201).json({ message: 'User successfully registered and wallet created.' });
    } catch (error) {
        console.error('Signup Error:', error);
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred during signup.'
        });
    }
    
});

