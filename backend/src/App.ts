import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import fs from 'fs';

import { authRouter } from './routes/authRoutes.js';
import { proofRouter } from './routes/proofRoutes.js';
import { DatabaseService } from './db/DatabaseService.js';
import { UserAccountManager } from './services/UserAccountManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const dbService = new DatabaseService();

//multer configuration
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
})
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'));
    }
  }
});

dotenv.config({ path: join(__dirname, '../../.env') });

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

    // Create uploads folder if it doesn't exist
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }

    const proofModule = await import('./routes/proofRoutes.js');
    const proofRoutesExport = (proofModule as any).default ?? (proofModule as any).proofRoutes;
    if (proofRoutesExport) {
      app.use('/api/proof', proofRoutesExport(upload));
    } else {
      console.warn('Warning: proofRoutes not found in module ./routes/proofRoutes.js');
    }

    // Route Handlers
    app.use('/api/auth', authRouter);
    app.use('/api/prover', proofRouter);

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

startServer();