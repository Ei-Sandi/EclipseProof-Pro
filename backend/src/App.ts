import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (one level up from backend/dist)
dotenv.config({ path: join(__dirname, '../../.env') });

import { authRouter } from './routes/authRoutes.js';
import { DatabaseService } from './db/DatabaseService.js';
import { UserAccountManager } from './services/UserAccountManager.js';

const app = express();
const PORT = process.env.PORT || 3000;
const dbService = new DatabaseService();

async function startServer() {
    try {
        // Initialize Database (Must complete before server starts)
        console.log('🔗 Attempting to initialize database...');
        await dbService.initDb();
        console.log('✅ Database connection successful!');

        // Global Middleware Setup
        app.use(express.json()); // Parses JSON bodies

        // Configure CORS to allow credentials
        app.use(cors({
            origin: 'http://localhost:5173', // Your frontend URL
            credentials: true
        }));

        // Configure session middleware
        app.use(session({
            secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false, // Set to true in production with HTTPS
                httpOnly: true,
                maxAge: 1000 * 60 * 30 // 30 mins
            }
        }));

        // Route Handlers
        app.use('/api/auth', authRouter); // Connects your login/signup endpoints

        // Server Start (Only runs if DB connection succeeded)
        const server = app.listen(PORT, () => {
            console.log(`⚡️ Server is running at http://localhost:${PORT}`);
        });

        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, closing server gracefully...');
            server.close(async () => {
                await UserAccountManager.cleanup();
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            console.log('\nSIGINT received, closing server gracefully...');
            server.close(async () => {
                await UserAccountManager.cleanup();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ FATAL ERROR: Server startup failed.', error);
        process.exit(1);
    }
}

// Start the entire application sequence
startServer();
