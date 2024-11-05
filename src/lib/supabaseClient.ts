import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://ynwmnbkkhsezbzbcztjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud21uYmtraHNlemJ6YmN6dGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTQwODQsImV4cCI6MjA0NTY5MDA4NH0.6dSY9ZTVPn_u0ZHO2GvWTcWIf0OpTR30J0IgqUqJYRg';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);