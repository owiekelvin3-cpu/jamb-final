// JAMB CBT Platform - Configuration
// Environment variables and app settings

// App Configuration
const APP_CONFIG = {
  name: 'JAMB CBT Platform',
  version: '2.0.0',
  description: 'Professional Computer-Based Testing for JAMB Examination',
  
  // API Endpoints
  api: {
    baseUrl: window.location.origin,
    timeout: 30000, // 30 seconds
  },
  
  // Exam Configuration
  exam: {
    defaultDuration: 90, // minutes
    questionsPerPage: 1,
    passingScore: 70,
    maxAttempts: 3,
    subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Government', 'Literature', 'Economics'],
  },
  
  // UI Configuration
  ui: {
    theme: 'light',
    animations: true,
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
  },
  
  // Local Storage Keys
  storage: {
    user: 'jamb_user',
    token: 'jamb_token',
    examState: 'jamb_exam_state',
    preferences: 'jamb_preferences',
    lastActivity: 'jamb_last_activity',
  }
};

// Environment Detection
const ENVIRONMENT = {
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  isStaging: window.location.hostname.includes('staging') || window.location.hostname.includes('dev'),
};

// Supabase Configuration
const SUPABASE_CONFIG = {
  url: ENVIRONMENT.isDevelopment 
    ? 'https://lwfxbyuquzjgukrznwqk.supabase.co'
    : 'https://lwfxbyuquzjgukrznwqk.supabase.co', // Replace with production URL
  anonKey: ENVIRONMENT.isDevelopment
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZnhieXVxdXpqZ3Vrcnpud3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTk3MTcsImV4cCI6MjA5MTY5NTcxN30.vSxj_bpNsNUREo6THSmFdEqE7xIc8flWcskEoLXiuIQ'
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZnhieXVxdXpqZ3Vrcnpud3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTk3MTcsImV4cCI6MjA5MTY5NTcxN30.vSxj_bpNsNUREo6THSmFdEqE7xIc8flWcskEoLXiuIQ', // Replace with production key
};

// Error Messages
const ERROR_MESSAGES = {
  network: 'Network connection failed. Please check your internet connection.',
  timeout: 'Request timed out. Please try again.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied. Please login to continue.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error occurred. Please try again later.',
  validation: 'Please check your input and try again.',
  examInProgress: 'You have an exam in progress. Please complete it before starting a new one.',
  examTimeExpired: 'Exam time has expired. Your answers have been submitted automatically.',
  insufficientQuestions: 'Not enough questions available for the selected criteria.',
};

// Success Messages
const SUCCESS_MESSAGES = {
  login: 'Login successful! Welcome back.',
  logout: 'You have been logged out successfully.',
  signup: 'Account created successfully! Please check your email to verify your account.',
  profileUpdated: 'Profile updated successfully.',
  examSubmitted: 'Exam submitted successfully! Your results are being calculated.',
  answerSaved: 'Answer saved successfully.',
};

// Validation Rules
const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 6,
    maxLength: 128,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    maxLength: 16,
  },
};

// Performance Monitoring
const PERFORMANCE = {
  enabled: true,
  trackPageViews: true,
  trackUserActions: true,
  trackErrors: true,
  sampleRate: 0.1, // 10% of users
};

// Feature Flags
const FEATURES = {
  analytics: true,
  realTimeUpdates: true,
  offlineMode: false,
  darkMode: false,
  notifications: true,
  socialSharing: true,
  exportResults: true,
  reviewMode: true,
  adaptiveDifficulty: false,
};

// Export configuration
window.CONFIG = {
  ...APP_CONFIG,
  ENVIRONMENT,
  SUPABASE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  PERFORMANCE,
  FEATURES,
};

// Development helpers
if (ENVIRONMENT.isDevelopment) {
  console.log('JAMB CBT Platform - Development Mode');
  console.log('Configuration:', window.CONFIG);
}

// Environment variable validation
function validateEnvironment() {
  const required = ['SUPABASE_CONFIG.url', 'SUPABASE_CONFIG.anonKey'];
  const missing = [];
  
  required.forEach(path => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], window.CONFIG);
    if (!value) missing.push(path);
  });
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    return false;
  }
  
  return true;
}

// Initialize configuration
function initConfig() {
  if (!validateEnvironment()) {
    throw new Error('Invalid configuration. Please check environment variables.');
  }
  
  // Set up error handling
  window.addEventListener('error', (event) => {
    if (PERFORMANCE.trackErrors) {
      console.error('Application Error:', event.error);
    }
  });
  
  // Set up performance monitoring
  if (PERFORMANCE.enabled && PERFORMANCE.trackPageViews) {
    console.log('Page loaded:', window.location.pathname);
  }
}

// Export initialization function
window.initConfig = initConfig;
