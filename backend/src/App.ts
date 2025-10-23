import express from 'express';
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

const app = express();
const PORT = process.env.PORT || 3000;
const dbService = new DatabaseService();

async function startServer() {
    try {
        // Step 1: Initialize Database (Must complete before server starts)
        console.log('🔗 Attempting to initialize database...');
        await dbService.initDb();
        console.log('✅ Database connection successful!');

        // Step 2: Global Middleware Setup
        app.use(express.json()); // Parses JSON bodies
        app.use(cors());         // Enables Cross-Origin requests

        // Step 3: Route Handlers
        app.use('/api/auth', authRouter); // Connects your login/signup endpoints

        // Step 4: Server Start (Only runs if DB connection succeeded)
        app.listen(PORT, () => {
            console.log(`⚡️ Server is running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ FATAL ERROR: Server startup failed.', error);
        process.exit(1);
    }
}

// Start the entire application sequence
startServer();
