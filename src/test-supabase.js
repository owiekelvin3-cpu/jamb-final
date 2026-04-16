// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

// Test with hardcoded values to debug
const testUrl = 'https://lwfxbyuquzjgukrznwqk.supabase.co';
const testKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZnhieXVxdXpqZ3Vrcnpud3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTk3MTcsImV4cCI6MjA5MTY5NTcxN30.vSxj_bpNsNUREo6THSmFdEqE7xIc8flWcskEoLXiuIQ';

console.log('Testing Supabase connection...');
console.log('URL:', testUrl);
console.log('Key starts with:', testKey.substring(0, 20) + '...');

const testClient = createClient(testUrl, testKey);

// Test basic connection
export const testConnection = async () => {
  try {
    const { data, error } = await testClient.auth.getSession();
    console.log('Connection test result:', { data, error });
    return { data, error };
  } catch (err) {
    console.error('Connection test error:', err);
    return { data: null, error: err.message };
  }
};
