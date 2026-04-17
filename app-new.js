// JAMB CBT Platform - Main Application
// Production-ready CBT examination platform

class JAMBApp {
  constructor() {
    this.currentScreen = 'loading';
    this.screens = {};
    this.subjects = [];
    this.userStats = null;
    this.init();
  }

  async init() {
    try {
      console.log('Initializing JAMB CBT Platform...');
      
      // Initialize configuration
      if (window.initConfig) {
        window.initConfig();
      }

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
      }

      // Initialize screens
      this.initializeScreens();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize services
      await this.initializeServices();
      
      // Check authentication state
      await this.checkAuthState();
      
      console.log('JAMB CBT Platform initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  initializeScreens() {
    // Cache screen elements
    this.screens = {
      loading: document.getElementById('loading-screen'),
      auth: document.getElementById('auth-screen'),
      dashboard: document.getElementById('dashboard-screen'),
      exam: document.getElementById('exam-screen'),
      results: document.getElementById('results-screen'),
    };

    // Cache content sections
    this.contentSections = {
      dashboard: document.getElementById('dashboard-content'),
      practice: document.getElementById('practice-content'),
      exam: document.getElementById('exam-content'),
      results: document.getElementById('results-content'),
      profile: document.getElementById('profile-content'),
    };
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        this.showDashboardSection(screen);
      });
    });

    // Authentication
    this.setupAuthListeners();

    // User menu
    this.setupUserMenuListeners();

    // Quick actions
    this.setupQuickActionListeners();

    // Exam controls
    this.setupExamListeners();

    // Window events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  setupAuthListeners() {
    // Login form
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // Signup form
    const signupForm = document.getElementById('signup-form-element');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignup();
      });
    }

    // Form toggles
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    
    if (showSignupBtn) {
      showSignupBtn.addEventListener('click', () => this.showSignupForm());
    }
    
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => this.showLoginForm());
    }

    // Password visibility toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = e.target.closest('.input-group').querySelector('input');
        const icon = e.target.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
  }

  setupUserMenuListeners() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('hidden');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.add('hidden');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  setupQuickActionListeners() {
    const quickPracticeBtn = document.getElementById('quick-practice');
    const quickExamBtn = document.getElementById('quick-exam');
    const quickReviewBtn = document.getElementById('quick-review');

    if (quickPracticeBtn) {
      quickPracticeBtn.addEventListener('click', () => this.showDashboardSection('practice'));
    }

    if (quickExamBtn) {
      quickExamBtn.addEventListener('click', () => this.showDashboardSection('exam'));
    }

    if (quickReviewBtn) {
      quickReviewBtn.addEventListener('click', () => this.showDashboardSection('results'));
    }
  }

  setupExamListeners() {
    // Exam controls
    const submitExamBtn = document.getElementById('submit-exam');
    const flagQuestionBtn = document.getElementById('flag-question');
    const prevQuestionBtn = document.getElementById('prev-question');
    const nextQuestionBtn = document.getElementById('next-question');

    if (submitExamBtn) {
      submitExamBtn.addEventListener('click', () => this.handleSubmitExam());
    }

    if (flagQuestionBtn) {
      flagQuestionBtn.addEventListener('click', () => this.handleFlagQuestion());
    }

    if (prevQuestionBtn) {
      prevQuestionBtn.addEventListener('click', () => window.ExamEngine.previousQuestion());
    }

    if (nextQuestionBtn) {
      nextQuestionBtn.addEventListener('click', () => window.ExamEngine.nextQuestion());
    }

    // Results actions
    const reviewAnswersBtn = document.getElementById('review-answers');
    const retakeExamBtn = document.getElementById('retake-exam');
    const backToDashboardBtn = document.getElementById('back-to-dashboard');

    if (reviewAnswersBtn) {
      reviewAnswersBtn.addEventListener('click', () => this.handleReviewAnswers());
    }

    if (retakeExamBtn) {
      retakeExamBtn.addEventListener('click', () => this.handleRetakeExam());
    }

    if (backToDashboardBtn) {
      backToDashboardBtn.addEventListener('click', () => this.showScreen('dashboard'));
    }
  }

  async initializeServices() {
    // Wait for database to be ready
    if (window.Database) {
      await window.Database.init();
    }

    // Set up exam engine listeners
    if (window.ExamEngine) {
      this.setupExamEngineListeners();
    }

    // Set up auth listeners
    if (window.Auth) {
      window.Auth.onAuthChange((event, user) => {
        this.handleAuthStateChange(event, user);
      });
    }
  }

  setupExamEngineListeners() {
    window.ExamEngine.addEventListener('exam_started', (exam) => {
      this.showScreen('exam');
      this.renderExamInterface(exam);
    });

    window.ExamEngine.addEventListener('question_changed', (data) => {
      this.renderQuestion(data.question, data.index, data.total);
    });

    window.ExamEngine.addEventListener('answer_selected', (data) => {
      this.updateQuestionGrid();
    });

    window.ExamEngine.addEventListener('timer_updated', (data) => {
      this.updateTimer(data.timeRemaining, data.totalTime);
    });

    window.ExamEngine.addEventListener('time_expired', () => {
      window.UI.showMessage('warning', 'Time expired! Your exam has been submitted automatically.');
    });

    window.ExamEngine.addEventListener('exam_completed', (exam) => {
      this.showExamResults(exam);
    });
  }

  async checkAuthState() {
    try {
      const isAuthenticated = await window.Auth.checkAuthState();
      
      if (isAuthenticated && window.Auth.currentUser) {
        await this.loadUserData();
        this.showScreen('dashboard');
      } else {
        this.showScreen('auth');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      this.showScreen('auth');
    }
  }

  async loadUserData() {
    try {
      // Load subjects
      const subjectsResult = await window.Database.getSubjects();
      if (subjectsResult.success) {
        this.subjects = subjectsResult.data;
      }

      // Load user stats
      const statsResult = await window.Database.getUserStats(window.Auth.currentUser.id);
      if (statsResult.success) {
        this.userStats = statsResult.data;
      }

      // Load user profile
      const profileResult = await window.Auth.getProfile();
      if (profileResult.success && profileResult.data) {
        this.updateUserProfile(profileResult.data);
      }

      // Update dashboard
      this.renderDashboard();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // Screen Management
  showScreen(screenName) {
    // Hide all screens
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.add('hidden');
    });

    // Show target screen
    const targetScreen = this.screens[screenName];
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      this.currentScreen = screenName;
    }

    // Update navigation
    if (screenName === 'dashboard') {
      window.UI.updateNavigation('dashboard');
    }
  }

  showDashboardSection(sectionName) {
    // Hide all content sections
    Object.values(this.contentSections).forEach(section => {
      if (section) section.classList.add('hidden');
    });

    // Show target section
    const targetSection = this.contentSections[sectionName];
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    // Update navigation
    window.UI.updateNavigation(sectionName);

    // Load section-specific data
    this.loadSectionData(sectionName);
  }

  async loadSectionData(sectionName) {
    switch (sectionName) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'practice':
        this.renderPracticeSubjects();
        break;
      case 'exam':
        this.renderExamSetup();
        break;
      case 'results':
        this.renderResults();
        break;
      case 'profile':
        this.renderProfile();
        break;
    }
  }

  // Authentication Handlers
  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      window.UI.showMessage('error', 'Please enter both email and password');
      return;
    }

    window.UI.showLoading('login-form', 'Signing in...');

    try {
      const result = await window.Auth.signIn(email, password);
      
      if (result.success) {
        await this.loadUserData();
        this.showScreen('dashboard');
        this.clearLoginForm();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      window.UI.hideLoading('login-form');
    }
  }

  async handleSignup() {
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    if (password !== confirmPassword) {
      window.UI.showMessage('error', 'Passwords do not match');
      return;
    }

    window.UI.showLoading('signup-form', 'Creating account...');

    try {
      const result = await window.Auth.signUp(firstName, lastName, email, password);
      
      if (result.success) {
        this.showLoginForm();
        this.clearSignupForm();
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      window.UI.hideLoading('signup-form');
    }
  }

  async handleLogout() {
    try {
      await window.Auth.signOut();
      this.showScreen('auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Form Management
  showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
  }

  showSignupForm() {
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('signup-error').style.display = 'none';
  }

  clearLoginForm() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
  }

  clearSignupForm() {
    document.getElementById('signup-firstname').value = '';
    document.getElementById('signup-lastname').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
  }

  // Dashboard Rendering
  renderDashboard() {
    if (!this.userStats) return;

    // Update welcome message
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName) {
      welcomeName.textContent = window.Auth.getDisplayName();
    }

    // Update stats
    this.updateDashboardStats();

    // Update subject cards
    this.renderSubjectCards();

    // Update performance chart
    this.renderPerformanceChart();
  }

  updateDashboardStats() {
    const stats = this.userStats;
    
    // Update stat cards
    document.getElementById('overall-score').textContent = `${Math.round(stats.averageScore)}%`;
    document.getElementById('total-attempts').textContent = stats.totalAttempts;
    document.getElementById('best-score').textContent = `${stats.bestScore}%`;
    document.getElementById('streak').textContent = '7'; // TODO: Calculate actual streak
  }

  renderSubjectCards() {
    const container = document.getElementById('subject-cards');
    if (!container || !this.subjects.length) return;

    container.innerHTML = '';

    this.subjects.forEach(subject => {
      const subjectStats = this.userStats.subjectPerformance[subject.name] || {
        attempts: 0,
        averageScore: 0,
        bestScore: 0,
      };

      const card = window.UI.createSubjectCard(subject, subjectStats, (selectedSubject) => {
        this.startPracticeSession(selectedSubject);
      });

      container.appendChild(card);
    });
  }

  renderPerformanceChart() {
    const container = document.getElementById('performance-chart');
    if (!container || !this.userStats.recentAttempts.length) return;

    const data = this.userStats.recentAttempts.map(attempt => ({
      subject: attempt.subjects?.name || 'Unknown',
      score: attempt.score,
      percentage: attempt.score,
    }));

    window.UI.createPerformanceChart('performance-chart', data);
  }

  // Practice Section
  renderPracticeSubjects() {
    const container = document.getElementById('practice-subjects');
    if (!container || !this.subjects.length) return;

    container.innerHTML = '';

    this.subjects.forEach(subject => {
      const card = window.UI.createSubjectCard(subject, {
        attempts: 0,
        percentage: 0,
        bestScore: 0,
      }, (selectedSubject) => {
        this.startPracticeSession(selectedSubject);
      });

      container.appendChild(card);
    });
  }

  async startPracticeSession(subject) {
    try {
      const result = await window.ExamEngine.startExam(
        [subject.id],
        'practice',
        20, // 20 questions for practice
        30  // 30 minutes
      );

      if (!result.success) {
        window.UI.showMessage('error', result.error);
      }
    } catch (error) {
      console.error('Start practice session error:', error);
      window.UI.showMessage('error', 'Failed to start practice session');
    }
  }

  // Exam Section
  renderExamSetup() {
    this.renderSubjectSelection();
  }

  renderSubjectSelection() {
    const container = document.getElementById('subject-selection');
    if (!container || !this.subjects.length) return;

    container.innerHTML = this.subjects.map(subject => `
      <label class="checkbox-item">
        <input type="checkbox" name="subjects" value="${subject.id}">
        <span class="checkbox-label">
          <i class="fas ${subject.icon}" style="color: ${subject.color}"></i>
          ${subject.name}
        </span>
      </label>
    `).join('');
  }

  async handleStartExam() {
    const selectedSubjects = Array.from(document.querySelectorAll('input[name="subjects"]:checked'))
      .map(input => input.value);

    if (selectedSubjects.length === 0) {
      window.UI.showMessage('error', 'Please select at least one subject');
      return;
    }

    const questionCount = parseInt(document.getElementById('question-count').value);
    const timeLimit = parseInt(document.getElementById('time-limit').value);

    try {
      const result = await window.ExamEngine.startExam(
        selectedSubjects,
        'mock',
        questionCount,
        timeLimit
      );

      if (!result.success) {
        window.UI.showMessage('error', result.error);
      }
    } catch (error) {
      console.error('Start exam error:', error);
      window.UI.showMessage('error', 'Failed to start exam');
    }
  }

  // Exam Interface
  renderExamInterface(exam) {
    // Update exam header
    document.getElementById('exam-subject').textContent = exam.type === 'mock' ? 'Mock Exam' : 'Practice';
    document.getElementById('exam-questions').textContent = `${exam.totalQuestions} Questions`;

    // Render question grid
    this.renderQuestionGrid();

    // Render first question
    const firstQuestion = window.ExamEngine.getCurrentQuestion();
    if (firstQuestion) {
      this.renderQuestion(firstQuestion, 0, exam.totalQuestions);
    }

    // Start timer
    this.updateTimer(window.ExamEngine.timeRemaining, exam.duration);
  }

  renderQuestion(question, index, total) {
    // Update question number
    document.getElementById('question-number').textContent = `Question ${index + 1}`;

    // Update question text
    document.getElementById('question-text').textContent = question.question_text;

    // Render options
    const container = document.getElementById('options-container');
    const currentAnswer = window.ExamEngine.getAnswer(question.id);
    container.innerHTML = window.UI.createQuestionOptions(
      question,
      currentAnswer?.selected,
      null,
      false
    );

    // Update flag button
    const flagBtn = document.getElementById('flag-question');
    if (window.ExamEngine.isFlagged(question.id)) {
      flagBtn.classList.add('flagged');
      flagBtn.innerHTML = '<i class="fas fa-flag"></i> Unflag';
    } else {
      flagBtn.classList.remove('flagged');
      flagBtn.innerHTML = '<i class="fas fa-flag"></i> Flag';
    }

    // Update navigation buttons
    document.getElementById('prev-question').disabled = index === 0;
    document.getElementById('next-question').disabled = index === total - 1;

    // Update question grid
    this.renderQuestionGrid();
  }

  renderQuestionGrid() {
    const container = document.getElementById('question-grid');
    if (!container) return;

    const exam = window.ExamEngine.currentExam;
    if (!exam) return;

    const answers = Object.entries(window.ExamEngine.answers).map(([questionId, answer]) => ({
      questionId,
      questionIndex: exam.questions.findIndex(q => q.id === questionId),
      selected: answer.selected,
    }));

    container.innerHTML = window.UI.createQuestionGrid(
      exam.questions.length,
      answers,
      window.ExamEngine.flaggedQuestions,
      null
    );
  }

  updateTimer(timeRemaining, totalTime) {
    const timerElement = document.getElementById('exam-timer');
    if (timerElement) {
      timerElement.textContent = window.UI.formatTime(timeRemaining);
    }
  }

  async handleSubmitExam() {
    const unansweredCount = window.ExamEngine.getUnansweredCount();
    
    if (unansweredCount > 0) {
      window.UI.showConfirm(
        'Submit Exam',
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`,
        () => window.ExamEngine.submitExam()
      );
    } else {
      window.UI.showConfirm(
        'Submit Exam',
        'Are you sure you want to submit your exam? You cannot change your answers after submission.',
        () => window.ExamEngine.submitExam()
      );
    }
  }

  handleFlagQuestion() {
    const currentQuestion = window.ExamEngine.getCurrentQuestion();
    if (currentQuestion) {
      window.ExamEngine.toggleFlag(currentQuestion.id);
    }
  }

  // Results
  async showExamResults(examResult) {
    this.showScreen('results');
    
    // Update results display
    const container = document.querySelector('.results-container');
    if (container) {
      container.innerHTML = window.UI.createResultsDisplay(examResult);
    }

    // Update header info
    document.getElementById('result-subject').textContent = examResult.type === 'mock' ? 'Mock Exam' : 'Practice';
    document.getElementById('result-date').textContent = new Date().toLocaleDateString();
    document.getElementById('result-duration').textContent = window.UI.formatTime(examResult.timeTaken);
  }

  async renderResults() {
    if (!window.Auth.currentUser) return;

    try {
      const result = await window.Database.getExamAttempts(window.Auth.currentUser.id);
      if (result.success) {
        this.renderResultsList(result.data);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  }

  renderResultsList(attempts) {
    const container = document.getElementById('results-container');
    if (!container) return;

    if (attempts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-chart-line"></i>
          <h3>No Exam Results Yet</h3>
          <p>Take your first exam to see your results here.</p>
          <button class="btn btn-primary" onclick="app.showDashboardSection('exam')">
            Start Exam
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = attempts.map(attempt => `
      <div class="result-card">
        <div class="result-header">
          <h4>${attempt.subjects?.name || 'Unknown'}</h4>
          <span class="result-date">${new Date(attempt.created_at).toLocaleDateString()}</span>
        </div>
        <div class="result-score">${attempt.score}%</div>
        <div class="result-details">
          <span>${attempt.correct_answers || 0}/${attempt.total_questions} Correct</span>
          <span>${window.UI.formatTime(attempt.duration_seconds || 0)}</span>
        </div>
      </div>
    `).join('');
  }

  // Profile
  async renderProfile() {
    const profileResult = await window.Auth.getProfile();
    if (profileResult.success && profileResult.data) {
      this.updateProfileForm(profileResult.data);
    }
  }

  updateProfileForm(profile) {
    document.getElementById('profile-firstname').value = profile.first_name || '';
    document.getElementById('profile-lastname').value = profile.last_name || '';
    document.getElementById('profile-email').value = window.Auth.currentUser.email;
    document.getElementById('profile-phone').value = profile.phone || '';
    document.getElementById('profile-school').value = profile.target_school || '';
    document.getElementById('profile-course').value = profile.target_course || '';
  }

  updateUserProfile(profile) {
    const userName = document.getElementById('user-name');
    if (userName) {
      userName.textContent = window.Auth.getDisplayName();
    }
  }

  // Event Handlers
  handleAuthStateChange(event, user) {
    if (event === 'signed_in' && user) {
      this.loadUserData();
      this.showScreen('dashboard');
    } else if (event === 'signed_out') {
      this.showScreen('auth');
    }
  }

  handleBeforeUnload(event) {
    if (window.ExamEngine && window.ExamEngine.isExamActive()) {
      event.preventDefault();
      event.returnValue = 'You have an exam in progress. Are you sure you want to leave?';
      return event.returnValue;
    }
  }

  handleOnline() {
    window.UI.showMessage('success', 'Internet connection restored');
  }

  handleOffline() {
    window.UI.showMessage('warning', 'Internet connection lost. Some features may not work properly.');
  }

  // Utility Methods
  showError(message) {
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div class="error-screen">
          <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Application Error</h2>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }

  // Public API
  showDashboardSection(sectionName) {
    this.showDashboardSection(sectionName);
  }
}

// Create and export app instance
const app = new JAMBApp();

// Export for global access
window.App = app;

// Add start exam button listener
document.addEventListener('DOMContentLoaded', () => {
  const startExamBtn = document.getElementById('start-exam');
  if (startExamBtn) {
    startExamBtn.addEventListener('click', () => app.handleStartExam());
  }
});
