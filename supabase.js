import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://geuhourlgzysalpkfyfv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_W25z6-ADK4KYhVpkFupTSg_foh6uEfz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
