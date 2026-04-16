// Environment variable debugging
console.log('=== Environment Variables Check ===');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);

// Check if we're in development
console.log('NODE_ENV:', process.env.NODE_ENV);

export const getSupabaseConfig = () => {
  const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  console.log('Final config:', { url: url?.substring(0, 30) + '...', hasKey: !!key });
  
  return { url, key };
};
