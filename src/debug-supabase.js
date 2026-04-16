// Debug Supabase connection with new key format
import { createClient } from '@supabase/supabase-js';

console.log('=== Supabase Debug ===');
console.log('URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Key:', process.env.REACT_APP_SUPABASE_ANON_KEY);
console.log('Key format:', process.env.REACT_APP_SUPABASE_ANON_KEY?.startsWith('sb_publishable_') ? 'New format' : 'JWT format');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic auth call
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Connection result:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Supabase connection successful!');
    return { success: true, data };
    
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return { success: false, error: err.message };
  }
};
