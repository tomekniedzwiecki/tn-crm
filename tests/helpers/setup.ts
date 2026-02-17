import { config } from 'dotenv'

// Load environment variables
config()

// Verify required env vars
const required = ['SUPABASE_SERVICE_KEY']
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Warning: Missing ${key} in environment`)
  }
}
