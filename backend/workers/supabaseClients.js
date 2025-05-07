// backend/supabaseClients.js
import dotenv from 'dotenv'
dotenv.config()            // ← ensure this runs first

import { createClient } from '@supabase/supabase-js'

// Public (anon) client — read-only
export const anonClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Admin (service-role) client — can write
export const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
