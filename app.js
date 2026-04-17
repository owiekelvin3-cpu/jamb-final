// JAMB Success App - Vanilla HTML/CSS/JavaScript Implementation

// Application State
let currentUser = null;
let userProgress = {};
let currentScreen = 'home';
let selectedSubject = null;
let selectedLevel = null;
let selectedTopic = null;
let topicStep = 'learn';
let practiceAnswers = {};
let testAnswers = {};
let showFeedback = {};
let testSubmitted = false;
let mockMode = false;
let mockAnswers = {};
let mockSubmitted = false;
let mockTimeLeft = 120 * 60;
let currentMockQuestions = [];
let mockTimerInterval = null;

// DOM Elements - Add null checks to prevent errors
const elements = {
    screens: {
        home: document.getElementById('home-screen'),
        auth: document.getElementById('auth-screen'),
        subject: document.getElementById('subject-screen'),
        topic: document.getElementById('topic-screen'),
        mock: document.getElementById('mock-screen')
    },
    buttons: {
        userMenu: document.getElementById('user-menu-btn'),
        logout: document.getElementById('logout-btn'),
        toggleToSignup: document.getElementById('toggle-to-signup'),
        toggleToLogin: document.getElementById('toggle-to-login'),
        subjectBack: document.getElementById('subject-back-btn'),
        topicBack: document.getElementById('topic-back-btn'),
        startPractice: document.getElementById('start-practice-btn'),
        startTest: document.getElementById('start-test-btn'),
        backToPractice: document.getElementById('back-to-practice-btn'),
        submitTest: document.getElementById('submit-test-btn'),
        nextTopic: document.getElementById('next-topic-btn'),
        retryTest: document.getElementById('retry-test-btn'),
        backToSubject: document.getElementById('result-back-btn'),
        startMock: document.getElementById('start-mock-btn'),
        submitMock: document.getElementById('submit-mock-btn'),
        backToDashboard: document.getElementById('mock-back-btn')
    },
    displays: {
        loadingScreen: document.getElementById('loading-screen'),
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        loginError: document.getElementById('login-error'),
        signupError: document.getElementById('signup-error'),
        loginSuccess: document.getElementById('login-success'),
        signupSuccess: document.getElementById('signup-success'),
        authToggle: document.getElementById('auth-toggle-text'),
        toggleToSignup: document.getElementById('toggle-to-signup'),
        toggleToLogin: document.getElementById('toggle-to-login'),
        subjectsGrid: document.querySelector('.subjects-grid'),
        overallProgress: document.getElementById('overall-progress-card'),
        progressMessage: document.getElementById('progress-message'),
        subjectsCompleted: document.getElementById('subjects-completed'),
        mockExamAccess: document.getElementById('mock-exam-access'),
        subjectTitle: document.getElementById('subject-title'),
        subjectScreenIcon: document.getElementById('subject-icon'),
        subjectScreenName: document.getElementById('subject-name'),
        topicTitle: document.getElementById('topic-title'),
        topicSubjectIcon: document.getElementById('topic-subject-icon'),
        topicSubjectName: document.getElementById('topic-subject-name'),
        topicLevelInfo: document.getElementById('topic-level-info'),
        learnStep: document.getElementById('learn-step'),
        practiceStep: document.getElementById('practice-step'),
        testStep: document.getElementById('test-step'),
        learnContent: document.getElementById('learn-content'),
        practiceContent: document.getElementById('practice-content'),
        testContent: document.getElementById('test-content'),
        practiceQuestions: document.getElementById('practice-questions'),
        testQuestions: document.getElementById('test-questions'),
        testActions: document.getElementById('test-actions'),
        backToPracticeBtn: document.getElementById('back-to-practice-btn'),
        submitTestBtn: document.getElementById('submit-test-btn'),
        resultIcon: document.getElementById('result-icon'),
        resultTitle: document.getElementById('result-title'),
        resultScore: document.getElementById('result-score'),
        resultMessage: document.getElementById('result-message'),
        resultActions: document.getElementById('result-actions'),
        mockTimer: document.getElementById('mock-timer'),
        mockQuestions: document.getElementById('mock-questions-container'),
        mockActions: document.getElementById('mock-actions'),
        submitMockBtn: document.getElementById('submit-mock-btn'),
        timeDisplay: document.getElementById('time-display')
    }
};

// Screen Management
function showScreen(screenName) {
    Object.keys(elements.screens).forEach(screen => {
        if (elements.screens[screen]) {
            elements.screens[screen].classList.add('hidden');
        }
    });
    
    if (elements.screens[screenName]) {
        elements.screens[screenName].classList.remove('hidden');
    }
    
    currentScreen = screenName;
}

function showLoading(show) {
    if (elements.displays.loadingScreen) {
        if (show) {
            elements.displays.loadingScreen.classList.remove('hidden');
        } else {
            elements.displays.loadingScreen.classList.add('hidden');
        }
    }
}

function hasCompletedMathematicsFoundation() {
    const mathematics = window.Curriculum?.CURRICULUM?.mathematics;
    const foundationTopics = mathematics?.levels?.[1]?.topics || [];

    if (foundationTopics.length === 0) {
        return false;
    }

    return foundationTopics.every(topic => userProgress?.mathematics?.[topic.id]?.completed);
}

function getSubjectIdByName(subjectName) {
    return Object.keys(window.Curriculum.CURRICULUM).find(subjectId =>
        window.Curriculum.CURRICULUM[subjectId].name === subjectName
    ) || null;
}

function buildLatestScoresMap(testResults) {
    const scores = {};

    testResults.forEach(result => {
        const subjectId = getSubjectIdByName(result.subject);
        if (!subjectId) return;

        const subject = window.Curriculum.CURRICULUM[subjectId];
        for (const level of Object.values(subject.levels)) {
            const topic = level.topics.find(item => item.title === result.topic);
            if (!topic) continue;

            if (!scores[subjectId]) {
                scores[subjectId] = {};
            }
            scores[subjectId][topic.id] = result.score;
            return;
        }
    });

    return scores;
}

// Progress Management
function loadProgress() {
    if (!currentUser) return;
    
    Promise.all([
        SupabaseClient.getProgress(currentUser.id),
        SupabaseClient.getTestResults(currentUser.id)
    ])
        .then(([progressResult, testResultsResult]) => {
            if (!progressResult.success) {
                throw new Error(progressResult.error || 'Failed to load progress');
            }

            const latestScores = testResultsResult.success ? buildLatestScoresMap(testResultsResult.data) : {};
            const progress = {};

            progressResult.data.forEach(item => {
                const separatorIndex = item.lesson_id.indexOf('_');
                const subjectId = separatorIndex >= 0 ? item.lesson_id.slice(0, separatorIndex) : item.lesson_id;
                const topicId = separatorIndex >= 0 ? item.lesson_id.slice(separatorIndex + 1) : '';

                if (!progress[subjectId]) progress[subjectId] = {};
                progress[subjectId][topicId] = {
                    completed: item.completed,
                    score: latestScores[subjectId]?.[topicId] || 0,
                    status: item.completed ? 'passed' : 'in_progress'
                };
            });

            userProgress = progress;
            updateUI();
        })
        .catch(error => {
            console.error('Error loading progress:', error);
        });
}

function saveProgress(subjectId, topicId, completed, score = 0) {
    if (!currentUser) return;
    
    const lessonId = `${subjectId}_${topicId}`;
    
    // Update local state
    if (!userProgress[subjectId]) {
        userProgress[subjectId] = {};
    }
    userProgress[subjectId][topicId] = {
        completed: completed,
        score: score,
        status: completed ? 'passed' : 'in_progress'
    };
    
    // Save to Supabase
    SupabaseClient.saveProgress(currentUser.id, lessonId, completed)
        .then(result => {
            if (!result.success) {
                console.error('Error saving progress:', result.error);
            }
        })
        .catch(error => {
            console.error('Error saving progress:', error);
        });
    
    updateUI();
}

// UI Updates
function updateUI() {
    if (currentScreen === 'home') {
        renderHomeScreen();
    }
}

function renderHomeScreen() {
    if (!elements.displays.subjectsGrid) return;
    
    const subjects = Object.keys(window.Curriculum.CURRICULUM);
    const mockExamAccess = elements.displays.mockExamAccess;
    const mathFoundationUnlocked = hasCompletedMathematicsFoundation();
    elements.displays.subjectsGrid.innerHTML = '';
    
    subjects.forEach(subjectId => {
        const subject = window.Curriculum.CURRICULUM[subjectId];
        const progress = window.Curriculum.getSubjectProgress(subjectId, userProgress);
        const isUnlocked = subjectId === 'mathematics' || mathFoundationUnlocked;
        
        const subjectCard = document.createElement('div');
        subjectCard.className = `subject-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        subjectCard.setAttribute('data-subject', subjectId);
        
        subjectCard.innerHTML = `
            <div class="subject-icon" style="background: ${subject.light}; color: ${subject.color};">
                ${subject.emoji}
            </div>
            <h3>${subject.name}</h3>
            <div class="subject-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <span class="progress-text">${progress.percentage}%</span>
            </div>
            ${!isUnlocked ? '<div class="lock-overlay">Complete Mathematics Foundation level to unlock</div>' : ''}
        `;
        
        subjectCard.addEventListener('click', () => handleSubjectClick(subjectId));
        elements.displays.subjectsGrid.appendChild(subjectCard);
    });

    if (mockExamAccess) {
        elements.displays.subjectsGrid.appendChild(mockExamAccess);
    }
    
    // Update overall progress
    const completedSubjects = subjects.filter(subjectId =>
        window.Curriculum.getSubjectProgress(subjectId, userProgress).percentage === 100
    ).length;
    const allSubjectsComplete = subjects.every(subjectId => 
        window.Curriculum.getSubjectProgress(subjectId, userProgress).percentage === 100
    );
    
    if (elements.displays.subjectsCompleted) {
        elements.displays.subjectsCompleted.textContent = `${completedSubjects}/4`;
    }
    
    if (elements.displays.progressMessage) {
        elements.displays.progressMessage.textContent = allSubjectsComplete 
            ? "Congratulations! You've completed all subjects. Mock exam unlocked!"
            : "Start with Mathematics Foundation level to begin your JAMB journey!";
    }
    
    if (elements.displays.mockExamAccess) {
        elements.displays.mockExamAccess.style.display = allSubjectsComplete ? 'block' : 'none';
    }
}

// Event Handlers
function handleSubjectClick(subjectId) {
    const isUnlocked = subjectId === 'mathematics' || hasCompletedMathematicsFoundation();
    
    if (!isUnlocked) {
        alert('Complete Mathematics Foundation level to unlock this subject!');
        return;
    }
    
    selectedSubject = subjectId;
    selectedLevel = 1;
    renderSubjectScreen();
    showScreen('subject');
}

function renderSubjectScreen() {
    const subject = window.Curriculum.CURRICULUM[selectedSubject];
    if (!subject) return;
    
    // Update subject header
    if (elements.displays.subjectTitle) {
        elements.displays.subjectTitle.textContent = subject.name;
    }
    
    if (elements.displays.subjectScreenIcon) {
        elements.displays.subjectScreenIcon.textContent = subject.emoji;
    }
    
    if (elements.displays.subjectScreenName) {
        elements.displays.subjectScreenName.textContent = subject.name;
    }
    
    // Render levels and topics
    const levelsContainer = document.querySelector('.levels-container');
    if (levelsContainer) {
        levelsContainer.innerHTML = '';
        
        Object.values(subject.levels).forEach(level => {
            const levelElement = document.createElement('div');
            levelElement.className = 'level-section';
            
            levelElement.innerHTML = `
                <h3>Level ${level.id}: ${level.name}</h3>
                <div class="topics-grid">
                    ${level.topics.map(topic => {
                        const progress = userProgress[selectedSubject]?.[topic.id];
                        const isCompleted = progress?.completed || false;
                        const isUnlocked = window.Curriculum.isTopicUnlocked(selectedSubject, level.id, topic.id, userProgress);
                        
                        return `
                            <div class="topic-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}" 
                                 data-topic="${topic.id}" data-level="${level.id}">
                                <div class="topic-status">
                                    ${isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked'}
                                </div>
                                <h4>${topic.title}</h4>
                                ${isCompleted ? `<div class="topic-score">Score: ${progress.score || 0}%</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            levelsContainer.appendChild(levelElement);
        });
        
        // Add click handlers for topics
        levelsContainer.onclick = (e) => {
            const topicCard = e.target.closest('.topic-card');
            if (topicCard && !topicCard.classList.contains('locked')) {
                const topicId = topicCard.getAttribute('data-topic');
                const levelId = parseInt(topicCard.getAttribute('data-level'));
                handleTopicClick(topicId, levelId);
            }
        };
    }
}

function handleTopicClick(topicId, levelId) {
    selectedTopic = topicId;
    selectedLevel = levelId;
    topicStep = 'learn';
    practiceAnswers = {};
    testAnswers = {};
    showFeedback = {};
    testSubmitted = false;
    
    renderTopicScreen();
    showScreen('topic');
}

function renderTopicScreen() {
    const subject = window.Curriculum.CURRICULUM[selectedSubject];
    const level = subject.levels[selectedLevel];
    const topic = level.topics.find(t => t.id === selectedTopic);
    
    if (!topic) return;
    
    // Update topic header
    if (elements.displays.topicTitle) {
        elements.displays.topicTitle.textContent = topic.title;
    }

    if (elements.displays.topicSubjectIcon) {
        elements.displays.topicSubjectIcon.textContent = subject.emoji;
    }

    if (elements.displays.topicSubjectName) {
        elements.displays.topicSubjectName.textContent = subject.name;
    }
    
    if (elements.displays.topicLevelInfo) {
        elements.displays.topicLevelInfo.textContent = `Level ${selectedLevel}: ${level.name}`;
    }
    
    // Show learn step by default
    showTopicStep('learn');
}

function showTopicStep(step) {
    // Hide all steps
    if (elements.displays.learnStep) elements.displays.learnStep.classList.add('hidden');
    if (elements.displays.practiceStep) elements.displays.practiceStep.classList.add('hidden');
    if (elements.displays.testStep) elements.displays.testStep.classList.add('hidden');
    
    // Show selected step
    if (elements.displays[step + 'Step']) {
        elements.displays[step + 'Step'].classList.remove('hidden');
    }
    
    topicStep = step;
    
    if (step === 'learn') {
        renderLearnContent();
    } else if (step === 'practice') {
        renderPracticeContent();
    } else if (step === 'test') {
        renderTestContent();
    }
}

function renderLearnContent() {
    const subject = window.Curriculum.CURRICULUM[selectedSubject];
    const level = subject.levels[selectedLevel];
    const topic = level.topics.find(t => t.id === selectedTopic);
    
    if (!topic || !elements.displays.learnContent) return;
    
    elements.displays.learnContent.innerHTML = `
        <div class="learn-section">
            <div class="learn-content">
                <p>${topic.learn.content}</p>
                ${topic.learn.video ? `
                    <div class="video-container">
                        <iframe src="${topic.learn.video}" frameborder="0" allowfullscreen></iframe>
                    </div>
                ` : ''}
            </div>
            <div class="learn-actions">
                <button class="btn-primary" onclick="showTopicStep('practice')">
                    Start Practice
                </button>
            </div>
        </div>
    `;
}

function renderPracticeContent() {
    const subject = window.Curriculum.CURRICULUM[selectedSubject];
    const level = subject.levels[selectedLevel];
    const topic = level.topics.find(t => t.id === selectedTopic);
    
    if (!topic || !elements.displays.practiceQuestions) return;
    
    elements.displays.practiceQuestions.innerHTML = '';
    
    topic.practice.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'practice-question';
        
        questionElement.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.question}</p>
            <div class="options">
                ${question.options.map((option, optionIndex) => `
                    <button class="option-btn ${practiceAnswers[index] === optionIndex ? 'selected' : ''}" 
                            onclick="handlePracticeAnswer(${index}, ${optionIndex})">
                        ${option}
                    </button>
                `).join('')}
            </div>
            ${showFeedback[index] ? `
                <div class="feedback">
                    <p><strong>Explanation:</strong> ${question.explanation}</p>
                </div>
            ` : ''}
        `;
        
        elements.displays.practiceQuestions.appendChild(questionElement);
    });
}

function handlePracticeAnswer(questionIndex, answerIndex) {
    practiceAnswers[questionIndex] = answerIndex;
    showFeedback[questionIndex] = true;
    renderPracticeContent();
}

function renderTestContent() {
    const subject = window.Curriculum.CURRICULUM[selectedSubject];
    const level = subject.levels[selectedLevel];
    const topic = level.topics.find(t => t.id === selectedTopic);
    
    if (!topic || !elements.displays.testQuestions) return;
    
    elements.displays.testQuestions.innerHTML = '';
    
    topic.test.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'test-question';
        
        questionElement.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.q}</p>
            <div class="options">
                ${question.options.map((option, optionIndex) => `
                    <button class="option-btn ${testAnswers[index] === optionIndex ? 'selected' : ''}" 
                            onclick="handleTestAnswer(${index}, ${optionIndex})">
                        ${option}
                    </button>
                `).join('')}
            </div>
        `;
        
        elements.displays.testQuestions.appendChild(questionElement);
    });
}

function handleTestAnswer(questionIndex, answerIndex) {
    testAnswers[questionIndex] = answerIndex;
    renderTestContent();
}

async function handleTestSubmit() {
    const subject = window.Curriculum.CURRICULUM[selectedSubject];
    const level = subject.levels[selectedLevel];
    const topic = level.topics.find(t => t.id === selectedTopic);
    
    if (!topic || !currentUser) return;
    
    // Calculate score
    let correct = 0;
    topic.test.forEach((question, index) => {
        if (testAnswers[index] === question.answer) correct++;
    });
    
    const score = Math.round((correct / topic.test.length) * 100);
    const passed = score >= 70;
    
    // Save progress and test result
    saveProgress(selectedSubject, selectedTopic, passed, score);
    
    await SupabaseClient.saveTestResult(
        currentUser.id, 
        subject.name, 
        topic.title, 
        score, 
        passed
    );
    
    testSubmitted = true;
    renderTestResult(passed, score);
}

function renderTestResult(passed, score) {
    if (!elements.displays.testContent) return;
    
    elements.displays.testContent.innerHTML = `
        <div class="test-result">
            <div class="result-icon">
                ${passed ? '🏆' : '📘'}
            </div>
            <h2>${passed ? 'Test Passed!' : 'Not Yet - Keep Going!'}</h2>
            <div class="result-score">${score}%</div>
            <p class="result-message">
                ${passed 
                    ? 'Excellent work! You\'ve mastered this topic. Next topic unlocked!'
                    : `You scored ${score}%. Review the material and try again.`
                }
            </p>
            <div class="result-actions">
                ${!passed ? `
                    <button class="btn-secondary" onclick="showTopicStep('learn')">Review Material</button>
                    <button class="btn-primary" onclick="retryTest()">Retry Test</button>
                ` : ''}
                ${passed ? `
                    <button class="btn-primary" onclick="goToNextTopic()">Next Topic</button>
                ` : ''}
            </div>
        </div>
    `;
}

function retryTest() {
    testAnswers = {};
    showFeedback = {};
    testSubmitted = false;
    showTopicStep('test');
}

function goToNextTopic() {
    const nextTopic = window.Curriculum.getNextTopic(selectedSubject, selectedLevel, selectedTopic, userProgress);
    if (nextTopic) {
        handleTopicClick(nextTopic.id, selectedLevel);
    } else {
        // Go back to subject screen
        showScreen('subject');
    }
}

// Authentication
async function handleLogin(email, password) {
    showLoading(true);
    
    try {
        const result = await SupabaseClient.signIn(email, password);
        
        if (result.success) {
            currentUser = result.data.user;
            showScreen('home');
            loadProgress();
        } else {
            showLoginError(result.error);
        }
    } catch (error) {
        showLoginError('Login failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleSignup(name, email, password, confirmPassword) {
    if (password !== confirmPassword) {
        showSignupError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showSignupError('Password must be at least 6 characters');
        return;
    }
    
    showLoading(true);
    
    try {
        const result = await SupabaseClient.signUp(email, password, name);
        
        if (result.success) {
            showSignupSuccess('Account created successfully! Please check your email to verify your account.');
            // Clear form
            document.getElementById('signup-name').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';
            // Switch to login form
            toggleToLogin();
        } else {
            showSignupError(result.error);
        }
    } catch (error) {
        showSignupError('Registration failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await SupabaseClient.signOut();
        currentUser = null;
        userProgress = {};
        showScreen('auth');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showLoginError(message) {
    if (elements.displays.signupError) {
        elements.displays.signupError.style.display = 'none';
    }
    if (elements.displays.loginError) {
        elements.displays.loginError.textContent = message;
        elements.displays.loginError.style.display = 'block';
    }
}

function showSignupError(message) {
    if (elements.displays.loginError) {
        elements.displays.loginError.style.display = 'none';
    }
    if (elements.displays.signupError) {
        elements.displays.signupError.textContent = message;
        elements.displays.signupError.style.display = 'block';
    }
}

function showSignupSuccess(message) {
    if (elements.displays.signupSuccess) {
        elements.displays.signupSuccess.textContent = message;
        elements.displays.signupSuccess.style.display = 'block';
    }
}

function toggleToSignup() {
    if (elements.displays.loginForm) elements.displays.loginForm.classList.add('hidden');
    if (elements.displays.signupForm) elements.displays.signupForm.classList.remove('hidden');
    if (elements.displays.loginError) elements.displays.loginError.style.display = 'none';
    if (elements.displays.signupError) elements.displays.signupError.style.display = 'none';
    if (elements.displays.signupSuccess) elements.displays.signupSuccess.style.display = 'none';
    if (elements.displays.authToggle) elements.displays.authToggle.textContent = 'Already have an account?';
    if (elements.displays.toggleToSignup) elements.displays.toggleToSignup.classList.add('hidden');
    if (elements.displays.toggleToLogin) elements.displays.toggleToLogin.classList.remove('hidden');
}

function toggleToLogin() {
    if (elements.displays.signupForm) elements.displays.signupForm.classList.add('hidden');
    if (elements.displays.loginForm) elements.displays.loginForm.classList.remove('hidden');
    if (elements.displays.loginError) elements.displays.loginError.style.display = 'none';
    if (elements.displays.signupError) elements.displays.signupError.style.display = 'none';
    if (elements.displays.signupSuccess) elements.displays.signupSuccess.style.display = 'none';
    if (elements.displays.authToggle) elements.displays.authToggle.textContent = "Don't have an account?";
    if (elements.displays.toggleToLogin) elements.displays.toggleToLogin.classList.add('hidden');
    if (elements.displays.toggleToSignup) elements.displays.toggleToSignup.classList.remove('hidden');
}

// Mock Exam Functions
function startMockExam() {
    mockMode = true;
    mockAnswers = {};
    mockSubmitted = false;
    mockTimeLeft = 120 * 60; // 2 hours
    
    generateMockExam();
    updateMockTimerDisplay();
    startMockTimer();
    showScreen('mock');
}

function generateMockExam() {
    const allQuestions = [];
    const subjects = Object.keys(window.Curriculum.CURRICULUM);
    
    subjects.forEach(subjectId => {
        const subject = window.Curriculum.CURRICULUM[subjectId];
        const level4 = subject.levels[4];
        
        level4.topics.forEach(topic => {
            topic.test.forEach(question => {
                allQuestions.push({
                    ...question,
                    subject: subject.name,
                    topic: topic.title,
                    id: Math.random().toString(36).substr(2, 9)
                });
            });
        });
    });
    
    // Shuffle and select 60-100 questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    currentMockQuestions = shuffled.slice(0, 60 + Math.floor(Math.random() * 41));
    
    renderMockExam();
}

function renderMockExam() {
    if (!elements.displays.mockQuestions) return;
    
    elements.displays.mockQuestions.innerHTML = '';
    
    currentMockQuestions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'mock-question';
        
        questionElement.innerHTML = `
            <div class="question-header">
                <span class="question-number">Q${index + 1}</span>
                <span class="question-subject">${question.subject}</span>
            </div>
            <p class="question-text">${question.q}</p>
            <div class="question-options">
                ${question.options.map((option, optionIndex) => `
                    <button class="option-btn ${mockAnswers[question.id] === optionIndex ? 'selected' : ''}" 
                            onclick="handleMockAnswer('${question.id}', ${optionIndex})">
                        ${option}
                    </button>
                `).join('')}
            </div>
        `;
        
        elements.displays.mockQuestions.appendChild(questionElement);
    });
}

function handleMockAnswer(questionId, answerIndex) {
    mockAnswers[questionId] = answerIndex;
    renderMockExam();
}

async function submitMockExam() {
    if (!currentUser || currentMockQuestions.length === 0) return;
    
    // Calculate score
    let correct = 0;
    
    currentMockQuestions.forEach(question => {
        const selectedAnswer = mockAnswers[question.id];
        if (selectedAnswer === question.answer) correct++;
    });
    
    const score = Math.round((correct / currentMockQuestions.length) * 100);
    const passed = score >= 70;
    
    // Save mock exam result
    await SupabaseClient.saveTestResult(currentUser.id, 'Mock Exam', 'Comprehensive', score, passed);
    
    mockSubmitted = true;
    renderMockResult(passed, score);
}

function renderMockResult(passed, score) {
    if (!elements.displays.mockQuestions) return;
    
    elements.displays.mockQuestions.innerHTML = `
        <div class="mock-result">
            <div class="result-icon">
                ${passed ? '🏆' : '📘'}
            </div>
            <h2>Mock Exam ${passed ? 'Passed!' : 'Not Passed'}</h2>
            <div class="result-score">${score}%</div>
            <p class="result-message">
                ${passed 
                    ? 'Congratulations! You\'ve passed the mock exam with excellent performance.'
                    : 'Keep practicing! You\'re making good progress. Review the material and try again.'
                }
            </p>
            <div class="result-actions">
                <button class="btn-primary" onclick="handleBackToDashboard()">Back to Dashboard</button>
            </div>
        </div>
    `;
}

function handleBackToDashboard() {
    mockMode = false;
    currentMockQuestions = [];
    if (mockTimerInterval) {
        clearInterval(mockTimerInterval);
        mockTimerInterval = null;
    }
    showScreen('home');
}

// Timer functions for mock exam
function startMockTimer() {
    if (mockTimerInterval) {
        clearInterval(mockTimerInterval);
    }

    mockTimerInterval = setInterval(() => {
        if (mockTimeLeft > 0 && !mockSubmitted) {
            mockTimeLeft--;
            updateMockTimerDisplay();
        } else {
            clearInterval(mockTimerInterval);
            mockTimerInterval = null;
            if (!mockSubmitted) {
                submitMockExam();
            }
        }
    }, 1000);
}

function updateMockTimerDisplay() {
    if (elements.displays.timeDisplay) {
        const minutes = Math.floor(mockTimeLeft / 60);
        const seconds = mockTimeLeft % 60;
        elements.displays.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize App
function initApp() {
    console.log('Initializing JAMB Success app...');
    console.log('SupabaseClient available:', !!window.SupabaseClient);
    console.log('Curriculum available:', !!window.Curriculum);
    
    // Check if required dependencies are loaded
    if (!window.SupabaseClient) {
        console.error('SupabaseClient not loaded - showing error screen');
        document.getElementById('app').innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: #dc2626;">Error Loading Application</h2>
                    <p>Supabase client failed to load. Please refresh the page.</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh</button>
                </div>
            </div>
        `;
        return;
    }
    
    if (!window.Curriculum) {
        console.error('Curriculum not loaded - showing error screen');
        document.getElementById('app').innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: #dc2626;">Error Loading Application</h2>
                    <p>Curriculum data failed to load. Please refresh the page.</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">Refresh</button>
                </div>
            </div>
        `;
        return;
    }
    
    // Hide loading screen immediately
    showLoading(false);
    
    // Show auth screen by default as fallback
    showScreen('auth');
    
    // Check if user is already logged in
    SupabaseClient.getCurrentUser()
        .then(result => {
            console.log('User check result:', result);
            if (result.success && result.user) {
                currentUser = result.user;
                loadProgress();
                showScreen('home');
            } else {
                showScreen('auth');
            }
        })
        .catch(error => {
            console.error('Error checking user session:', error);
            showScreen('auth');
        });
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handleLogin(email, password);
        });
    }
    
    // Signup form
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            handleSignup(name, email, password, confirmPassword);
        });
    }
    
    // Toggle forms
    if (elements.buttons.toggleToSignup) {
        elements.buttons.toggleToSignup.addEventListener('click', toggleToSignup);
    }
    
    if (elements.buttons.toggleToLogin) {
        elements.buttons.toggleToLogin.addEventListener('click', toggleToLogin);
    }
    
    // Logout
    if (elements.buttons.logout) {
        elements.buttons.logout.addEventListener('click', handleLogout);
    }
    
    // Topic navigation
    if (elements.buttons.subjectBack) {
        elements.buttons.subjectBack.addEventListener('click', () => {
            showScreen('home');
        });
    }

    if (elements.buttons.topicBack) {
        elements.buttons.topicBack.addEventListener('click', () => {
            showScreen('subject');
        });
    }
    
    // Test submission
    if (elements.buttons.submitTest) {
        elements.buttons.submitTest.addEventListener('click', handleTestSubmit);
    }
    
    // Mock exam
    if (elements.buttons.startMock) {
        elements.buttons.startMock.addEventListener('click', startMockExam);
    }
    
    if (elements.buttons.submitMock) {
        elements.buttons.submitMock.addEventListener('click', submitMockExam);
    }
    
    if (elements.buttons.backToDashboard) {
        elements.buttons.backToDashboard.addEventListener('click', handleBackToDashboard);
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
