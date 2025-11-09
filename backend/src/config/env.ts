import * as dotenv from 'dotenv';

// Load environment variables from .env file
const result = dotenv.config();

if (result.error) {
  console.warn('Error loading .env file, relying on system environment variables.', result.error);
}
