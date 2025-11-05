# EclipseProof-Pro

A privacy-preserving income verification dapp using Zero-Knowledge Proofs built on midnight network.

**Previous Hackathon Proof of Concept Repository**: [EclipseProof-POC](https://github.com/Ei-Sandi/EclipseProof-POC)

## Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 14+
- Midnight SDK

## Database Setup

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@14
brew services start postgresql@14

# Windows
Download and install from https://www.postgresql.org/download/windows/
```

### 2. Create Database and User

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for the complete database schema and table creation scripts.

### 3. Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

## Installation
```bash
npm run install:all

```

**Note:** Compile the contract first before running backend/frontend:
```bash
npm run compile
```

## Backend

### Build and Run
```bash
cd backend
npm run build  # Compile TypeScript
npm start      # Run server
```
## Frontend

### Build and Run
```bash
cd frontend
npm run build  # Build for production
npm run dev    # Start development server
```

## Development
```bash
npm run dev
```

## Project Structure
- `/contract` - Compact smart contracts
- `/backend` - Express.js API server
- `/frontend` - React + Vite UI

## License
This project is licensed under the terms of the [LICENSE](LICENSE) file.

