/**
 * LLM connectivity test — OpenAI SDK
 *
 * Usage:
 *   1. Copy .env.example to .env.local and fill in your API key
 *   2. node backend/test-sdk.mjs
 *
 * Works with the standard OpenAI API and any DIAL-compatible gateway
 * (Azure-OpenAI-shaped — set OPENAI_BASE_URL to your gateway endpoint).
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import OpenAI from 'openai'

const API_KEY  = process.env.OPENAI_API_KEY
const BASE_URL = process.env.OPENAI_BASE_URL
const MODEL    = process.env.OPENAI_MODEL || 'gpt-4'

if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set. Add it to backend/.env.local')
  process.exit(1)
}

const client = new OpenAI({
  apiKey: API_KEY,
  ...(BASE_URL && {
    baseURL: `${BASE_URL}/openai/deployments/${MODEL}`,
    defaultHeaders: { 'Api-Key': API_KEY },
    defaultQuery: { 'api-version': '2024-10-21' },
  }),
})

const res = await client.chat.completions.create({
  model: MODEL,
  messages: [{ role: 'user', content: 'Reply with exactly: SDK connection successful.' }],
  max_tokens: 20,
})

console.log(res.choices[0].message.content)
