import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcenycnsjegpplffpqgk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZW55Y25zamVncHBsZmZwcWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjEzNjgsImV4cCI6MjA4NzMzNzM2OH0.2WPtNPXiBhnWq4TVswH_pFvOre0zcdOintEpk-x1H8s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
