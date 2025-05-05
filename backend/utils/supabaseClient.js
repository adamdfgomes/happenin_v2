import dotenv from 'dotenv';
dotenv.config();                        // ← load .env immediately

// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL; // Make sure this is in your .env
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This is for server-side access
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };