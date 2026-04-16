import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as supabaseLogout, login as supabaseLogin, signUp as supabaseSignUp, onAuthChange } from '../supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = onAuthChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabaseLogin(email, password);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message || error };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabaseSignUp(email, password, name);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message || error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabaseLogout();
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    signUp,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
