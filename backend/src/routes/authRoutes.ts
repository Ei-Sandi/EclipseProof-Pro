import express from 'express';
import { UserAccountManager } from '../services/UserAccountManager.js';

export const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Missing email or password' });
    }

    try {
        const userAccountManager = UserAccountManager.getInstance();
        await userAccountManager.signUp(email, password, confirmPassword);
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
        const userAccountManager = UserAccountManager.getInstance();
        const user = await userAccountManager.login(email, password, req.sessionID);

        req.session.userId = user.userID;
        req.session.email = user.email;

        return res.status(200).json({
            message: 'User successfully logged in.',
            user: {
                userId: user.userID,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred during login.'
        });
    }
});

authRouter.post('/logout', async (req, res) => {
    try {
        const userAccountManager = UserAccountManager.getInstance();
        await userAccountManager.logout(req.sessionID);

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ error: 'Failed to logout' });
            }
            res.clearCookie('connect.sid'); // Default session cookie name
            return res.status(200).json({ message: 'Successfully logged out' });
        });
    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'An unknown error occurred during logout.'
        });
    }
});

// Middleware to check if user is authenticated
export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userAccountManager = UserAccountManager.getInstance();

    if (!req.sessionID || !userAccountManager.isLoggedIn(req.sessionID)) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    next();
};

// Get current user info
authRouter.get('/me', requireAuth, (req, res) => {
    const userAccountManager = UserAccountManager.getInstance();
    const user = userAccountManager.getUser(req.sessionID);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
        userId: user.userID,
        email: user.email
    });
});

