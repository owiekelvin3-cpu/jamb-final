// Enhanced Supabase debugging
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('=== Supabase Debug Info ===');
console.log('URL:', SUPABASE_URL);
console.log('Key exists:', !!SUPABASE_ANON_KEY);
console.log('Key length:', SUPABASE_ANON_KEY?.length);
console.log('Key starts with:', SUPABASE_ANON_KEY?.substring(0, 20));

// Test connection with detailed error handling
let supabase;

try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration');
  }
  
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase client created successfully');
  
  // Test basic connection
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Session data:', data);
    }
  });
  
} catch (error) {
  console.error('❌ Supabase initialization error:', error);
  supabase = null;
}

export { supabase };
