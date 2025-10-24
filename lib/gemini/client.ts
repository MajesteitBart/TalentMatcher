// lib/gemini/client.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

export const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Model constants
export const MODELS = {
  PARSER: 'gemini-2.0-flash-exp',
  ANALYZER: 'gemini-2.0-flash-exp', // or 'gemini-1.5-pro' for better quality
  EMBEDDINGS: 'text-embedding-004',
} as const
