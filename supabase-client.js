// Supabase Client for Vanilla JavaScript
const { createClient } = supabase;

// Supabase configuration
const SUPABASE_URL = 'https://lwfxbyuquzjgukrznwqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZnhieXVxdXpqZ3Vrcnpud3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTk3MTcsImV4cCI6MjA5MTY5NTcxN30.vSxj_bpNsNUREo6THSmFdEqE7xIc8flWcskEoLXiuIQ';

// Create Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication functions
async function signUp(email, password, name) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name
                }
            }
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Progress functions
async function saveProgress(userId, lessonId, completed) {
    try {
        const { data, error } = await supabaseClient
            .from('progress')
            .upsert({
                user_id: userId,
                lesson_id: lessonId,
                completed: completed
            });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getProgress(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('progress')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function saveTestResult(userId, subject, topic, score, passed) {
    try {
        const { data, error } = await supabaseClient
            .from('test_results')
            .insert({
                user_id: userId,
                subject: subject,
                topic: topic,
                score: score,
                passed: passed
            });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getTestResults(userId) {
    try {
        const { data, error } = await supabaseClient
            .from('test_results')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Listen for auth changes
function onAuthChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
}

// Export functions
window.SupabaseClient = {
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    saveProgress,
    getProgress,
    saveTestResult,
    getTestResults,
    onAuthChange
};
