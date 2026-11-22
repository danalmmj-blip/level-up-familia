import { createClient } from '@supabase/supabase-js';
// Replace these with your Supabase project's URL and publishable key before building/deploying.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'YOUR-PUBLISHABLE-KEY';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
