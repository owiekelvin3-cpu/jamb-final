// JAMB CBT Platform - UI Components
// Reusable UI components and utilities

class UIComponents {
  constructor() {
    this.loadingStates = new Map();
    this.messageQueue = [];
    this.init();
  }

  init() {
    console.log('UI components initialized');
  }

  // Loading States
  showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const loadingHtml = `
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">${message}</p>
      </div>
    `;

    element.style.position = 'relative';
    element.insertAdjacentHTML('beforeend', loadingHtml);
    this.loadingStates.set(elementId, true);
  }

  hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const overlay = element.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }
    this.loadingStates.set(elementId, false);
  }

  // Messages and Notifications
  showMessage(type, message, duration = 5000) {
    const messageId = `msg-${Date.now()}`;
    const messageHtml = `
      <div id="${messageId}" class="message message-${type} animate-fade-in">
        <div class="message-content">
          <i class="fas ${this.getMessageIcon(type)}"></i>
          <span>${message}</span>
        </div>
        <button class="message-close" onclick="UI.hideMessage('${messageId}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add to queue
    this.messageQueue.push({ id: messageId, type, message, duration });
    this.renderMessages();

    // Auto-remove
    setTimeout(() => {
      this.hideMessage(messageId);
    }, duration);
  }

  hideMessage(messageId) {
    const element = document.getElementById(messageId);
    if (element) {
      element.classList.add('animate-fade-out');
      setTimeout(() => {
        element.remove();
        this.messageQueue = this.messageQueue.filter(msg => msg.id !== messageId);
      }, 300);
    }
  }

  renderMessages() {
    let container = document.getElementById('message-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'message-container';
      container.className = 'message-container';
      document.body.appendChild(container);
    }

    container.innerHTML = this.messageQueue.map(msg => `
      <div id="${msg.id}" class="message message-${msg.type} animate-fade-in">
        <div class="message-content">
          <i class="fas ${this.getMessageIcon(msg.type)}"></i>
          <span>${msg.message}</span>
        </div>
        <button class="message-close" onclick="UI.hideMessage('${msg.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  }

  getMessageIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle',
    };
    return icons[type] || 'fa-info-circle';
  }

  // Modal Management
  showModal(modalId, title, content, options = {}) {
    const modalHtml = `
      <div id="${modalId}" class="modal-overlay">
        <div class="modal ${options.size || 'medium'} animate-fade-in">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" onclick="UI.hideModal('${modalId}')">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add backdrop click to close
    const modal = document.getElementById(modalId);
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) {
        this.hideModal(modalId);
      }
    });
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('animate-fade-out');
      setTimeout(() => modal.remove(), 300);
    }
  }

  // Confirmation Dialog
  showConfirm(title, message, onConfirm, onCancel = null) {
    const content = `
      <div class="confirm-content">
        <i class="fas fa-exclamation-triangle confirm-icon"></i>
        <p>${message}</p>
      </div>
    `;
    
    const footer = `
      <button class="btn btn-secondary" onclick="UI.hideModal('confirm-dialog')">
        Cancel
      </button>
      <button class="btn btn-danger" onclick="UI.confirmAction()">
        Confirm
      </button>
    `;

    this.showModal('confirm-dialog', title, content, { footer });
    
    // Store callback
    this.confirmCallback = onConfirm;
    this.cancelCallback = onCancel;
  }

  confirmAction() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.hideModal('confirm-dialog');
  }

  // Form Validation
  validateForm(formElement, rules) {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const field = formElement.querySelector(`[name="${fieldName}"]`);
      const value = field ? field.value.trim() : '';
      const fieldRules = rules[fieldName];

      // Required validation
      if (fieldRules.required && !value) {
        errors[fieldName] = `${fieldName} is required`;
        isValid = false;
      }

      // Email validation
      if (fieldRules.email && value && !window.CONFIG.VALIDATION.email.test(value)) {
        errors[fieldName] = 'Please enter a valid email address';
        isValid = false;
      }

      // Length validation
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[fieldName] = `Minimum length is ${fieldRules.minLength} characters`;
        isValid = false;
      }

      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[fieldName] = `Maximum length is ${fieldRules.maxLength} characters`;
        isValid = false;
      }

      // Pattern validation
      if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
        errors[fieldName] = fieldRules.message || 'Invalid format';
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  showFormErrors(formElement, errors) {
    // Clear previous errors
    formElement.querySelectorAll('.field-error').forEach(el => el.remove());

    // Show new errors
    Object.entries(errors).forEach(([fieldName, message]) => {
      const field = formElement.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
        field.classList.add('error');
      }
    });
  }

  clearFormErrors(formElement) {
    formElement.querySelectorAll('.field-error').forEach(el => el.remove());
    formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  // Chart Components
  createPerformanceChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Simple bar chart implementation
    const chartHtml = `
      <div class="performance-chart">
        <div class="chart-bars">
          ${data.map(item => `
            <div class="chart-bar">
              <div class="bar-fill" style="height: ${item.percentage}%"></div>
              <div class="bar-label">${item.subject}</div>
              <div class="bar-value">${item.score}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = chartHtml;
  }

  createScoreChart(containerId, score) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    const chartHtml = `
      <div class="score-chart">
        <svg class="score-circle" viewBox="0 0 100 100">
          <circle class="score-background" cx="50" cy="50" r="45"></circle>
          <circle class="score-progress" cx="50" cy="50" r="45" 
                  style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}"></circle>
        </svg>
        <div class="score-text">${score}%</div>
      </div>
    `;

    container.innerHTML = chartHtml;
  }

  // Subject Cards
  createSubjectCard(subject, stats, onClick) {
    const cardHtml = `
      <div class="subject-card" data-subject-id="${subject.id}">
        <div class="subject-card-header">
          <div class="subject-icon" style="background-color: ${subject.color}">
            <i class="fas ${subject.icon}"></i>
          </div>
          <div class="subject-info">
            <h4>${subject.name}</h4>
            <p>${subject.code}</p>
          </div>
        </div>
        <div class="subject-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.percentage || 0}%"></div>
          </div>
          <div class="progress-text">${stats.percentage || 0}% Complete</div>
        </div>
        <div class="subject-stats">
          <div class="stat">
            <span class="stat-value">${stats.attempts || 0}</span>
            <span class="stat-label">Attempts</span>
          </div>
          <div class="stat">
            <span class="stat-value">${stats.bestScore || 0}%</span>
            <span class="stat-label">Best Score</span>
          </div>
        </div>
        <button class="btn btn-primary btn-full">
          ${stats.percentage === 100 ? 'Review' : 'Practice'}
        </button>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHtml;
    const card = tempDiv.firstElementChild;

    // Add click handler
    card.addEventListener('click', () => onClick(subject));

    return card;
  }

  // Question Grid
  createQuestionGrid(totalQuestions, answers, flaggedQuestions, onQuestionClick) {
    const gridHtml = Array.from({ length: totalQuestions }, (_, index) => {
      const questionNumber = index + 1;
      const isAnswered = answers.some(a => a.questionIndex === index);
      const isFlagged = flaggedQuestions.has(index);
      const isCurrent = index === (window.ExamEngine?.currentQuestionIndex || 0);

      let statusClass = 'unanswered';
      if (isCurrent) statusClass = 'current';
      else if (isFlagged) statusClass = 'flagged';
      else if (isAnswered) statusClass = 'answered';

      return `
        <button class="grid-item ${statusClass}" 
                data-question-index="${index}"
                onclick="UI.handleQuestionClick(${index})">
          ${questionNumber}
        </button>
      `;
    }).join('');

    return `<div class="question-grid">${gridHtml}</div>`;
  }

  handleQuestionClick(index) {
    if (window.ExamEngine) {
      window.ExamEngine.goToQuestion(index);
    }
  }

  // Question Options
  createQuestionOptions(question, selectedAnswer, onAnswerSelect, isReviewMode = false) {
    const options = ['A', 'B', 'C', 'D'];
    
    return options.map(option => {
      const optionText = question[`option_${option.toLowerCase()}`];
      const isSelected = selectedAnswer === option;
      const isCorrect = question.correct_answer === option;
      
      let className = 'option';
      if (isSelected) className += ' selected';
      if (isReviewMode) {
        if (isCorrect) className += ' correct';
        else if (isSelected && !isCorrect) className += ' incorrect';
      }

      return `
        <button class="${className}" 
                data-option="${option}"
                onclick="UI.handleAnswerSelect('${option}')"
                ${isReviewMode ? 'disabled' : ''}>
          <div class="option-content">
            <span class="option-label">${option}.</span>
            <span class="option-text">${optionText}</span>
          </div>
          ${isReviewMode && isCorrect ? '<i class="fas fa-check option-correct"></i>' : ''}
          ${isReviewMode && isSelected && !isCorrect ? '<i class="fas fa-times option-incorrect"></i>' : ''}
        </button>
      `;
    }).join('');
  }

  handleAnswerSelect(option) {
    if (window.ExamEngine && !window.ExamEngine.isReviewMode) {
      const currentQuestion = window.ExamEngine.getCurrentQuestion();
      if (currentQuestion) {
        window.ExamEngine.selectAnswer(currentQuestion.id, option);
      }
    }
  }

  // Timer Display
  createTimerDisplay(timeRemaining, totalTime) {
    const percentage = (timeRemaining / totalTime) * 100;
    const formattedTime = this.formatTime(timeRemaining);
    
    let urgencyClass = '';
    if (percentage < 10) urgencyClass = 'urgent';
    else if (percentage < 25) urgencyClass = 'warning';

    return `
      <div class="timer ${urgencyClass}">
        <i class="fas fa-clock"></i>
        <span class="timer-text">${formattedTime}</span>
        <div class="timer-progress">
          <div class="timer-bar" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Results Display
  createResultsDisplay(examResult) {
    const grade = this.getGrade(examResult.score);
    
    return `
      <div class="results-summary">
        <div class="score-display">
          <div class="score-circle grade-${grade.class}">
            <div class="score-value">${examResult.score}%</div>
            <div class="score-grade">${grade.text}</div>
          </div>
        </div>
        
        <div class="results-stats">
          <div class="stat-row">
            <span class="stat-label">Questions Answered:</span>
            <span class="stat-value">${examResult.answeredQuestions}/${examResult.totalQuestions}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Correct Answers:</span>
            <span class="stat-value">${examResult.correctAnswers}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Wrong Answers:</span>
            <span class="stat-value">${examResult.wrongAnswers}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Time Taken:</span>
            <span class="stat-value">${this.formatTime(examResult.timeTaken)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Average Time:</span>
            <span class="stat-value">${this.formatTime(examResult.averageTimePerQuestion)}</span>
          </div>
        </div>
        
        <div class="results-message">
          <p>${this.getResultMessage(examResult.score, examResult.passed)}</p>
        </div>
      </div>
    `;
  }

  getGrade(score) {
    if (score >= 90) return { text: 'Excellent', class: 'excellent' };
    if (score >= 80) return { text: 'Very Good', class: 'very-good' };
    if (score >= 70) return { text: 'Good', class: 'good' };
    if (score >= 60) return { text: 'Average', class: 'average' };
    if (score >= 50) return { text: 'Below Average', class: 'below-average' };
    return { text: 'Poor', class: 'poor' };
  }

  getResultMessage(score, passed) {
    if (passed) {
      if (score >= 90) return 'Outstanding performance! You\'ve mastered this subject.';
      if (score >= 80) return 'Excellent work! Keep up the great performance.';
      if (score >= 70) return 'Good job! You passed the exam successfully.';
      return 'You passed! There\'s room for improvement.';
    } else {
      if (score >= 60) return 'Close to passing! A bit more practice will help.';
      if (score >= 50) return 'Keep practicing! You\'re making progress.';
      return 'Don\'t give up! Review the material and try again.';
    }
  }

  // Navigation
  updateNavigation(activeScreen) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const screen = item.dataset.screen;
      if (screen === activeScreen) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Responsive Helpers
  isMobile() {
    return window.innerWidth <= 768;
  }

  isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  isDesktop() {
    return window.innerWidth > 1024;
  }

  // Accessibility
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Keyboard Navigation
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Handle exam keyboard shortcuts
      if (window.ExamEngine && window.ExamEngine.isExamActive()) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            window.ExamEngine.previousQuestion();
            break;
          case 'ArrowRight':
            e.preventDefault();
            window.ExamEngine.nextQuestion();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
            e.preventDefault();
            this.handleAnswerSelect(String.fromCharCode(64 + parseInt(e.key)));
            break;
          case 'f':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const currentQuestion = window.ExamEngine.getCurrentQuestion();
              if (currentQuestion) {
                window.ExamEngine.toggleFlag(currentQuestion.id);
              }
            }
            break;
        }
      }
    });
  }
}

// Create and export UI components instance
const uiComponents = new UIComponents();

// Export for use in other modules
window.UI = uiComponents;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  uiComponents.setupKeyboardNavigation();
  console.log('UI components ready');
});
