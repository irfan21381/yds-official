import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Guard GROQ import - only initialize if API key exists
let groq: Groq | null = null;

if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
} else {
  console.warn('GROQ_API_KEY not found. AI features will be disabled.');
}

export default groq;