import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const getEnvVar = (reactAppVar, fallbackVar) => {
  const value = process.env[reactAppVar] || process.env[fallbackVar];
  console.log(`${reactAppVar} / ${fallbackVar}:`, value ? '✅ Set' : '❌ Missing');
  return value;
};

const SUPABASE_URL = getEnvVar('REACT_APP_SUPABASE_URL', 'SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('REACT_APP_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isConfigured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  isValidUrl(SUPABASE_URL) &&
  SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here' &&
  SUPABASE_ANON_KEY.startsWith('eyJ');

console.log('=== Supabase Configuration ===');
console.log('URL:', SUPABASE_URL);
console.log('Key exists:', !!SUPABASE_ANON_KEY);
console.log('Key length:', SUPABASE_ANON_KEY?.length);
console.log('Key format:', SUPABASE_ANON_KEY?.startsWith('eyJ') ? 'JWT' : 'New format');
console.log('Is configured:', isConfigured);

// Create Supabase client with error handling
let supabase = null;

try {
  if (isConfigured) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log('✅ Supabase client created successfully');
  } else {
    throw new Error('Supabase not properly configured');
  }
} catch (error) {
  console.error('❌ Supabase client creation failed:', error.message);
  supabase = null;
}

const configError = 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.';
const createConfigError = async () => ({ data: null, error: configError });

export const signUp = async (email, password, name) => {
  if (!supabase) return createConfigError();
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error?.message || error };
  }
};

export const login = async (email, password) => {
  if (!supabase) return createConfigError();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error?.message || error };
  }
};

export const logout = async () => {
  if (!supabase) return { error: configError };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error?.message || error };
  }
};

export const getCurrentUser = async () => {
  if (!supabase) return { user: null, error: configError };
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { user: data.session?.user ?? null, error: null };
  } catch (error) {
    return { user: null, error: error?.message || error };
  }
};

export const saveProgress = async ({ userId, lessonId, completed }) => {
  if (!supabase) return createConfigError();
  try {
    const { data, error } = await supabase
      .from('progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed,
        },
        { onConflict: ['user_id', 'lesson_id'] }
      )
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error?.message || error };
  }
};

export const getProgress = async (userId) => {
  if (!supabase) return { data: [], error: configError };
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('lesson_id,completed')
      .eq('user_id', userId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: [], error: error?.message || error };
  }
};

export const saveTestResult = async (userId, subject, topic, score, passed) => {
  if (!supabase) return createConfigError();
  try {
    const { data, error } = await supabase
      .from('test_results')
      .insert({
        user_id: userId,
        subject,
        topic,
        score,
        passed,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error?.message || error };
  }
};

export const getTestResults = async (userId) => {
  if (!supabase) return { data: [], error: configError };
  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: [], error: error?.message || error };
  }
};

export const onAuthChange = (callback) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
};
