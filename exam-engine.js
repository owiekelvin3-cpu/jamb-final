// JAMB CBT Platform - Exam Engine
// Core exam logic, timer, question management, and scoring

class ExamEngine {
  constructor() {
    this.currentExam = null;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.flaggedQuestions = new Set();
    this.timer = null;
    this.timeRemaining = 0;
    this.examStartTime = null;
    this.isReviewMode = false;
    this.listeners = [];
    this.init();
  }

  init() {
    console.log('Exam engine initialized');
  }

  // Exam Management
  async startExam(subjectIds, examType = 'mock', questionCount = 60, duration = 90) {
    try {
      // Check if user is authenticated
      if (!window.Auth.isAuthenticated) {
        throw new Error('User must be authenticated to start an exam');
      }

      // Check if there's already an exam in progress
      if (this.currentExam) {
        throw new Error(window.CONFIG.ERROR_MESSAGES.examInProgress);
      }

      // Get random questions
      const questionsResult = await window.Database.getRandomQuestions(subjectIds, questionCount);
      if (!questionsResult.success || questionsResult.data.length < questionCount) {
        throw new Error(window.CONFIG.ERROR_MESSAGES.insufficientQuestions);
      }

      // Create exam attempt in database
      const attemptResult = await window.Database.createExamAttempt(
        window.Auth.currentUser.id,
        subjectIds[0], // Primary subject
        examType,
        questionCount
      );

      if (!attemptResult.success) {
        throw new Error('Failed to create exam attempt');
      }

      // Initialize exam state
      this.currentExam = {
        id: attemptResult.data.id,
        type: examType,
        subjectIds,
        questions: questionsResult.data,
        totalQuestions: questionCount,
        duration: duration * 60, // Convert to seconds
        startTime: new Date(),
        attemptId: attemptResult.data.id,
      };

      this.currentQuestionIndex = 0;
      this.answers = {};
      this.flaggedQuestions.clear();
      this.timeRemaining = this.currentExam.duration;
      this.examStartTime = new Date();
      this.isReviewMode = false;

      // Start timer
      this.startTimer();

      // Auto-save setup
      this.setupAutoSave();

      // Notify listeners
      this.notifyListeners('exam_started', this.currentExam);

      console.log('Exam started:', this.currentExam);
      return { success: true, exam: this.currentExam };
    } catch (error) {
      console.error('Start exam error:', error);
      return { success: false, error: error.message };
    }
  }

  async submitExam() {
    try {
      if (!this.currentExam) {
        throw new Error('No exam in progress');
      }

      // Stop timer
      this.stopTimer();

      // Save all remaining answers
      await this.saveAllAnswers();

      // Complete exam attempt
      const result = await window.Database.completeExamAttempt(this.currentExam.attemptId);
      
      if (!result.success) {
        throw new Error('Failed to complete exam attempt');
      }

      // Calculate final stats
      const stats = this.calculateFinalStats();

      // Clear exam state
      const completedExam = { ...this.currentExam, ...stats };
      this.clearExam();

      // Notify listeners
      this.notifyListeners('exam_completed', completedExam);

      console.log('Exam submitted:', completedExam);
      return { success: true, exam: completedExam };
    } catch (error) {
      console.error('Submit exam error:', error);
      return { success: false, error: error.message };
    }
  }

  async pauseExam() {
    if (!this.currentExam) return;

    // Stop timer
    this.stopTimer();

    // Save current state
    await this.saveAllAnswers();

    // Notify listeners
    this.notifyListeners('exam_paused', this.currentExam);
  }

  async resumeExam() {
    if (!this.currentExam) return;

    // Restart timer
    this.startTimer();

    // Notify listeners
    this.notifyListeners('exam_resumed', this.currentExam);
  }

  // Question Navigation
  getCurrentQuestion() {
    if (!this.currentExam || this.currentQuestionIndex >= this.currentExam.questions.length) {
      return null;
    }
    return this.currentExam.questions[this.currentQuestionIndex];
  }

  goToQuestion(index) {
    if (!this.currentExam || index < 0 || index >= this.currentExam.questions.length) {
      return false;
    }

    this.currentQuestionIndex = index;
    this.notifyListeners('question_changed', {
      question: this.getCurrentQuestion(),
      index: index,
      total: this.currentExam.questions.length,
    });
    return true;
  }

  nextQuestion() {
    if (!this.currentExam) return false;
    
    const nextIndex = this.currentQuestionIndex + 1;
    if (nextIndex < this.currentExam.questions.length) {
      return this.goToQuestion(nextIndex);
    }
    return false;
  }

  previousQuestion() {
    if (!this.currentExam) return false;
    
    const prevIndex = this.currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      return this.goToQuestion(prevIndex);
    }
    return false;
  }

  // Answer Management
  selectAnswer(questionId, answer) {
    if (!this.currentExam) return false;

    const question = this.currentExam.questions.find(q => q.id === questionId);
    if (!question) return false;

    // Validate answer
    if (!['A', 'B', 'C', 'D'].includes(answer)) return false;

    // Save answer
    this.answers[questionId] = {
      selected: answer,
      isCorrect: answer === question.correct_answer,
      timeSpent: this.getTimeSpentOnQuestion(questionId),
      timestamp: new Date().toISOString(),
    };

    // Save to database (async, don't wait)
    this.saveAnswer(questionId, answer);

    // Notify listeners
    this.notifyListeners('answer_selected', {
      questionId,
      answer,
      isCorrect: this.answers[questionId].isCorrect,
    });

    return true;
  }

  getAnswer(questionId) {
    return this.answers[questionId] || null;
  }

  hasAnswered(questionId) {
    return questionId in this.answers;
  }

  getAnsweredCount() {
    return Object.keys(this.answers).length;
  }

  getUnansweredCount() {
    return this.currentExam ? this.currentExam.questions.length - this.getAnsweredCount() : 0;
  }

  // Flag Management
  toggleFlag(questionId) {
    if (!this.currentExam) return false;

    if (this.flaggedQuestions.has(questionId)) {
      this.flaggedQuestions.delete(questionId);
    } else {
      this.flaggedQuestions.add(questionId);
    }

    this.notifyListeners('flag_toggled', {
      questionId,
      isFlagged: this.flaggedQuestions.has(questionId),
    });

    return true;
  }

  isFlagged(questionId) {
    return this.flaggedQuestions.has(questionId);
  }

  getFlaggedCount() {
    return this.flaggedQuestions.size;
  }

  // Timer Management
  startTimer() {
    if (this.timer) return;

    this.timer = setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.handleTimeExpired();
      }

      this.notifyListeners('timer_updated', {
        timeRemaining: this.timeRemaining,
        totalTime: this.currentExam.duration,
      });
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  handleTimeExpired() {
    this.stopTimer();
    this.notifyListeners('time_expired', this.currentExam);
    
    // Auto-submit exam
    this.submitExam();
  }

  getTimeSpentOnQuestion(questionId) {
    // This is a simplified calculation
    // In a real implementation, you'd track when each question was viewed
    return Math.floor(Math.random() * 60) + 10; // 10-70 seconds
  }

  getFormattedTime() {
    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Auto-save
  setupAutoSave() {
    if (!window.CONFIG.ui.autoSave) return;

    this.autoSaveInterval = setInterval(() => {
      this.saveAllAnswers();
    }, window.CONFIG.ui.autoSaveInterval);
  }

  async saveAnswer(questionId, answer) {
    if (!this.currentExam) return;

    try {
      const question = this.currentExam.questions.find(q => q.id === questionId);
      if (!question) return;

      await window.Database.saveExamAnswer(
        this.currentExam.attemptId,
        questionId,
        answer,
        answer === question.correct_answer,
        this.getTimeSpentOnQuestion(questionId),
        this.isFlagged(questionId)
      );
    } catch (error) {
      console.error('Save answer error:', error);
    }
  }

  async saveAllAnswers() {
    if (!this.currentExam) return;

    const savePromises = Object.entries(this.answers).map(([questionId, answer]) => {
      return this.saveAnswer(questionId, answer.selected);
    });

    try {
      await Promise.all(savePromises);
      console.log('All answers saved successfully');
    } catch (error) {
      console.error('Save all answers error:', error);
    }
  }

  // Statistics and Analytics
  calculateFinalStats() {
    if (!this.currentExam) return {};

    const totalQuestions = this.currentExam.questions.length;
    const answeredQuestions = Object.keys(this.answers).length;
    const correctAnswers = Object.values(this.answers).filter(answer => answer.isCorrect).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= window.CONFIG.exam.passingScore;

    // Calculate time taken
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - this.examStartTime) / 1000); // seconds

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers: answeredQuestions - correctAnswers,
      unansweredQuestions: totalQuestions - answeredQuestions,
      score,
      passed,
      timeTaken,
      flaggedQuestions: this.flaggedQuestions.size,
      averageTimePerQuestion: answeredQuestions > 0 ? Math.floor(timeTaken / answeredQuestions) : 0,
    };
  }

  getProgress() {
    if (!this.currentExam) return 0;
    return Math.round((this.getAnsweredCount() / this.currentExam.questions.length) * 100);
  }

  getQuestionStatus(index) {
    if (!this.currentExam) return 'unanswered';
    
    const question = this.currentExam.questions[index];
    if (!question) return 'unanswered';

    if (this.isFlagged(question.id)) return 'flagged';
    if (this.hasAnswered(question.id)) return 'answered';
    return 'unanswered';
  }

  // Review Mode
  enterReviewMode(attemptId) {
    this.isReviewMode = true;
    this.notifyListeners('review_mode_entered', { attemptId });
  }

  exitReviewMode() {
    this.isReviewMode = false;
    this.notifyListeners('review_mode_exited');
  }

  // Exam State Management
  clearExam() {
    this.currentExam = null;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.flaggedQuestions.clear();
    this.stopTimer();
    this.timeRemaining = 0;
    this.examStartTime = null;
    this.isReviewMode = false;

    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    this.notifyListeners('exam_cleared');
  }

  // Event Listeners
  addEventListener(event, callback) {
    this.listeners.push({ event, callback });
  }

  removeEventListener(event, callback) {
    this.listeners = this.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback)
    );
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('Exam engine listener error:', error);
        }
      });
  }

  // Validation
  validateExamState() {
    if (!this.currentExam) {
      return { valid: false, error: 'No exam in progress' };
    }

    if (!window.Auth.isAuthenticated) {
      return { valid: false, error: 'User not authenticated' };
    }

    return { valid: true };
  }

  // Export/Import Exam State (for saving/loading)
  exportExamState() {
    if (!this.currentExam) return null;

    return {
      exam: this.currentExam,
      currentQuestionIndex: this.currentQuestionIndex,
      answers: this.answers,
      flaggedQuestions: Array.from(this.flaggedQuestions),
      timeRemaining: this.timeRemaining,
      examStartTime: this.examStartTime,
    };
  }

  importExamState(state) {
    if (!state || !state.exam) return false;

    this.currentExam = state.exam;
    this.currentQuestionIndex = state.currentQuestionIndex || 0;
    this.answers = state.answers || {};
    this.flaggedQuestions = new Set(state.flaggedQuestions || []);
    this.timeRemaining = state.timeRemaining || this.currentExam.duration;
    this.examStartTime = state.examStartTime ? new Date(state.examStartTime) : new Date();

    // Restart timer if needed
    if (this.timeRemaining > 0) {
      this.startTimer();
    }

    this.notifyListeners('exam_state_imported', this.currentExam);
    return true;
  }

  // Utility Methods
  getExamSummary() {
    if (!this.currentExam) return null;

    return {
      id: this.currentExam.id,
      type: this.currentExam.type,
      totalQuestions: this.currentExam.questions.length,
      answeredQuestions: this.getAnsweredCount(),
      flaggedQuestions: this.getFlaggedCount(),
      timeRemaining: this.timeRemaining,
      progress: this.getProgress(),
      currentQuestion: this.currentQuestionIndex + 1,
    };
  }

  isExamActive() {
    return this.currentExam !== null && !this.isReviewMode;
  }

  canSubmitExam() {
    if (!this.currentExam) return false;
    
    // Allow submission if all questions are answered or time is about to expire
    return this.getAnsweredCount() === this.currentExam.questions.length || 
           this.timeRemaining < 60; // Less than 1 minute remaining
  }
}

// Create and export exam engine instance
const examEngine = new ExamEngine();

// Export for use in other modules
window.ExamEngine = examEngine;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Exam engine ready');
});
