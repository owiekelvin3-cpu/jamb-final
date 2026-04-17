// JAMB CBT Platform - Authentication Service
// Secure user authentication and session management

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.authListeners = [];
    this.init();
  }

  async init() {
    try {
      // Check for existing session
      await this.checkAuthState();
      
      // Set up auth state listener
      if (window.Database?.client) {
        window.Database.client.auth.onAuthStateChange((event, session) => {
          this.handleAuthStateChange(event, session);
        });
      }
      
      console.log('Auth service initialized');
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
    }
  }

  // Authentication state management
  async checkAuthState() {
    try {
      const result = await window.Database.getCurrentUser();
      if (result.success && result.user) {
        this.setUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking auth state:', error);
      return false;
    }
  }

  handleAuthStateChange(event, session) {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session?.user) {
      this.setUser(session.user);
    } else if (event === 'SIGNED_OUT') {
      this.clearUser();
    } else if (event === 'TOKEN_REFRESHED') {
      // Token refreshed, user remains the same
      console.log('Auth token refreshed');
    }
  }

  setUser(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    
    // Store user data in localStorage for persistence
    localStorage.setItem(window.CONFIG.storage.user, JSON.stringify(user));
    
    // Notify listeners
    this.notifyAuthListeners('signed_in', user);
    
    console.log('User authenticated:', user.email);
  }

  clearUser() {
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Clear localStorage
    localStorage.removeItem(window.CONFIG.storage.user);
    localStorage.removeItem(window.CONFIG.storage.token);
    
    // Notify listeners
    this.notifyAuthListeners('signed_out', null);
    
    console.log('User signed out');
  }

  // Authentication methods
  async signUp(firstName, lastName, email, password, additionalData = {}) {
    try {
      // Validate input
      if (!this.validateSignupData(firstName, lastName, email, password)) {
        return { success: false, error: 'Invalid input data' };
      }

      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...additionalData,
      };

      const result = await window.Database.signUp(email, password, userData);
      
      if (result.success) {
        // Show success message
        this.showMessage('success', window.CONFIG.SUCCESS_MESSAGES.signup);
        return result;
      } else {
        this.showMessage('error', result.error);
        return result;
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.showMessage('error', window.CONFIG.ERROR_MESSAGES.serverError);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      // Validate input
      if (!this.validateSigninData(email, password)) {
        return { success: false, error: 'Invalid email or password' };
      }

      const result = await window.Database.signIn(email, password);
      
      if (result.success) {
        this.setUser(result.data.user);
        this.showMessage('success', window.CONFIG.SUCCESS_MESSAGES.login);
        return result;
      } else {
        this.showMessage('error', result.error);
        return result;
      }
    } catch (error) {
      console.error('Signin error:', error);
      this.showMessage('error', window.CONFIG.ERROR_MESSAGES.serverError);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const result = await window.Database.signOut();
      
      if (result.success) {
        this.clearUser();
        this.showMessage('success', window.CONFIG.SUCCESS_MESSAGES.logout);
        
        // Redirect to auth screen
        if (window.App?.showScreen) {
          window.App.showScreen('auth');
        }
      } else {
        this.showMessage('error', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Signout error:', error);
      this.showMessage('error', window.CONFIG.ERROR_MESSAGES.serverError);
      return { success: false, error: error.message };
    }
  }

  // Password reset
  async resetPassword(email) {
    try {
      if (!window.CONFIG.VALIDATION.email.test(email)) {
        return { success: false, error: 'Invalid email address' };
      }

      const { data, error } = await window.Database.client.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      this.showMessage('success', 'Password reset email sent. Please check your inbox.');
      return { success: true, data };
    } catch (error) {
      console.error('Password reset error:', error);
      this.showMessage('error', 'Failed to send password reset email.');
      return { success: false, error: error.message };
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      if (!this.validatePassword(newPassword)) {
        return { success: false, error: 'Password does not meet requirements' };
      }

      const { data, error } = await window.Database.client.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      this.showMessage('success', 'Password updated successfully.');
      return { success: true, data };
    } catch (error) {
      console.error('Update password error:', error);
      this.showMessage('error', 'Failed to update password.');
      return { success: false, error: error.message };
    }
  }

  // Validation methods
  validateSignupData(firstName, lastName, email, password) {
    // Name validation
    if (!firstName || !lastName) {
      this.showMessage('error', 'First name and last name are required');
      return false;
    }

    if (firstName.length < 2 || lastName.length < 2) {
      this.showMessage('error', 'Names must be at least 2 characters long');
      return false;
    }

    if (!window.CONFIG.VALIDATION.name.pattern.test(firstName) || !window.CONFIG.VALIDATION.name.pattern.test(lastName)) {
      this.showMessage('error', 'Names can only contain letters, spaces, hyphens, and apostrophes');
      return false;
    }

    // Email validation
    if (!window.CONFIG.VALIDATION.email.test(email)) {
      this.showMessage('error', 'Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!this.validatePassword(password)) {
      return false;
    }

    return true;
  }

  validateSigninData(email, password) {
    if (!window.CONFIG.VALIDATION.email.test(email)) {
      this.showMessage('error', 'Please enter a valid email address');
      return false;
    }

    if (!password || password.length < 1) {
      this.showMessage('error', 'Password is required');
      return false;
    }

    return true;
  }

  validatePassword(password) {
    const rules = window.CONFIG.VALIDATION.password;
    
    if (password.length < rules.minLength) {
      this.showMessage('error', `Password must be at least ${rules.minLength} characters long`);
      return false;
    }

    if (password.length > rules.maxLength) {
      this.showMessage('error', `Password must not exceed ${rules.maxLength} characters`);
      return false;
    }

    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      this.showMessage('error', 'Password must contain at least one uppercase letter');
      return false;
    }

    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      this.showMessage('error', 'Password must contain at least one lowercase letter');
      return false;
    }

    if (rules.requireNumbers && !/\d/.test(password)) {
      this.showMessage('error', 'Password must contain at least one number');
      return false;
    }

    if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      this.showMessage('error', 'Password must contain at least one special character');
      return false;
    }

    return true;
  }

  // Session management
  async refreshSession() {
    try {
      const { data, error } = await window.Database.client.auth.refreshSession();
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { success: false, error: error.message };
    }
  }

  // User profile management
  async updateProfile(profileData) {
    try {
      if (!this.isAuthenticated) {
        return { success: false, error: 'User not authenticated' };
      }

      const result = await window.Database.updateProfile(this.currentUser.id, profileData);
      
      if (result.success) {
        this.showMessage('success', window.CONFIG.SUCCESS_MESSAGES.profileUpdated);
      } else {
        this.showMessage('error', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      this.showMessage('error', window.CONFIG.ERROR_MESSAGES.serverError);
      return { success: false, error: error.message };
    }
  }

  async getProfile() {
    try {
      if (!this.isAuthenticated) {
        return { success: false, error: 'User not authenticated' };
      }

      const result = await window.Database.getProfile(this.currentUser.id);
      return result;
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Event listeners
  onAuthChange(callback) {
    this.authListeners.push(callback);
  }

  removeAuthListener(callback) {
    this.authListeners = this.authListeners.filter(listener => listener !== callback);
  }

  notifyAuthListeners(event, user) {
    this.authListeners.forEach(callback => {
      try {
        callback(event, user);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // UI helpers
  showMessage(type, message) {
    // Create or update message element
    let messageElement = document.getElementById('auth-message');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'auth-message';
      messageElement.className = 'message';
      document.body.appendChild(messageElement);
    }

    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageElement.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }

  // Security methods
  async checkSessionValidity() {
    try {
      const { data, error } = await window.Database.client.auth.getUser();
      if (error) throw error;
      
      if (!data.user) {
        this.clearUser();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session validity check error:', error);
      this.clearUser();
      return false;
    }
  }

  // Activity tracking
  updateLastActivity() {
    localStorage.setItem(window.CONFIG.storage.lastActivity, new Date().toISOString());
  }

  getLastActivity() {
    const lastActivity = localStorage.getItem(window.CONFIG.storage.lastActivity);
    return lastActivity ? new Date(lastActivity) : null;
  }

  // Auto-logout after inactivity
  setupAutoLogout(timeout = 30 * 60 * 1000) { // 30 minutes
    let timeoutId;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (this.isAuthenticated) {
          console.log('Auto-logout due to inactivity');
          this.signOut();
        }
      }, timeout);
    };

    // Reset timeout on user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activities.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Initial timeout
    resetTimeout();
  }

  // Get user display name
  getDisplayName() {
    if (!this.currentUser) return 'Guest';
    
    const userMetadata = this.currentUser.user_metadata || {};
    const firstName = userMetadata.firstName || userMetadata.first_name;
    const lastName = userMetadata.lastName || userMetadata.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else {
      return this.currentUser.email.split('@')[0];
    }
  }

  // Get user initials for avatar
  getInitials() {
    const displayName = this.getDisplayName();
    const names = displayName.split(' ');
    
    if (names.length >= 2) {
      return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
    } else if (names.length === 1) {
      return names[0][0].toUpperCase();
    } else {
      return 'U';
    }
  }
}

// Create and export auth service instance
const authService = new AuthService();

// Export for use in other modules
window.Auth = authService;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Setup auto-logout
  authService.setupAutoLogout();
  
  // Check initial auth state
  authService.checkAuthState();
});
