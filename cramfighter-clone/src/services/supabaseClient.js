import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and Anon Key
const supabaseUrl = 'YOUR_SUPABASE_URL'; // TODO: Replace with actual URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // TODO: Replace with actual anon key

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn(
    'Supabase URL or Anon Key is not configured. Please update src/services/supabaseClient.js with your project credentials.'
  );
  // Potentially throw an error or handle this more gracefully in a real app
  // For now, we'll allow the app to load but Supabase features won't work.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
