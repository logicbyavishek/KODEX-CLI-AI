import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
});

export const config = {
  googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  model: process.env.KODEX_MODEL || 'gemini-3.6-flash',
  fallbackModel: process.env.KODEX_FALLBACK_MODEL || 'gemini-3.5-flash-lite',
  maxRetries: Number.parseInt(process.env.KODEX_AI_MAX_RETRIES || '0', 10),
};

