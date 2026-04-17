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

// DOM Elements
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
        topicTitle: document.getElementById('topic-title'),
        subjectIcon: document.getElementById('topic-subject-icon'),
        subjectName: document.getElementById('topic-subject-name'),
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
        nextTopicBtn: document.getElementById('next-topic-btn'),
        retryTestBtn: document.getElementById('retry-test-btn'),
        mockTimer: document.getElementById('mock-timer'),
        timeDisplay: document.getElementById('time-display'),
        mockQuestionsContainer: document.getElementById('mock-questions-container'),
        mockActions: document.getElementById('mock-actions'),
        submitMockBtn: document.getElementById('submit-mock-btn'),
        backToDashboardBtn: document.getElementById('mock-back-btn'),
        keyPointsList: document.getElementById('key-points'),
        examplesList: document.getElementById('examples'),
        youtubeLink: document.getElementById('youtube-link'),
        confettiContainer: document.getElementById('confetti-container')
    }
};

// Screen Management
function showScreen(screenId) {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    elements.screens[screenId].classList.remove('hidden');
    currentScreen = screenId;
}

function hideAllScreens() {
    Object.values(elements.screens).forEach(screen => {
        screen.classList.add('hidden');
    });
}

// Authentication
function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = 'block';
}

function showSignupSuccess(message) {
    elements.signupSuccess.textContent = message;
    elements.signupSuccess.style.display = 'block';
}

function showAuthForm(formType) {
    elements.loginForm.classList.toggle('hidden', formType === 'login');
    elements.signupForm.classList.toggle('hidden', formType === 'signup');
    
    elements.authToggle.textContent = formType === 'login' ? "Don't have an account?" : "Already have an account?";
    elements.toggleToSignup.classList.toggle('hidden', formType === 'login');
    elements.toggleToLogin.classList.toggle('hidden', formType === 'signup');
}

// Data Management
function loadProgress() {
    const saved = localStorage.getItem('jambProgress');
    if (saved) {
        try {
            userProgress = JSON.parse(saved);
        } catch (error) {
            console.error('Error loading progress:', error);
            userProgress = {};
        }
    }
}

function saveProgress() {
    try {
        localStorage.setItem('jambProgress', JSON.stringify(userProgress));
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// Curriculum Data (simplified version for vanilla JS)
const CURRICULUM = {
    mathematics: {
        id: "mathematics",
        name: "Mathematics",
        icon: "📐",
        color: "#2563EB",
        light: "#EFF6FF",
        border: "#BFDBFE",
        levels: {
            1: {
                name: "Foundation",
                topics: [
                    {
                        id: "numbers",
                        title: "Numbers and Counting",
                        description: "Understanding whole numbers, counting, and basic operations",
                        keyPoints: [
                            "Counting numbers up to millions",
                            "Place value and face value",
                            "Basic addition and subtraction",
                            "Multiplication as repeated addition"
                        ],
                        examples: [
                            { q: "What is 345 + 127?", a: "345 + 127 = 472" },
                            { q: "Divide 48 by 6", a: "48 ÷ 6 = 8" }
                        ]
                    },
                    {
                        id: "fractions",
                        title: "Fractions and Decimals",
                        description: "Understanding parts of whole numbers and decimal numbers",
                        keyPoints: [
                            "Proper and improper fractions",
                            "Mixed numbers",
                            "Decimal place value",
                            "Converting fractions to decimals"
                        ],
                        examples: [
                            { q: "Add 1/2 + 1/4", a: "1/2 + 1/4 = 3/4" },
                            { q: "Convert 3/4 to decimal", a: "3/4 = 0.75" }
                        ]
                    }
                ],
            },
            2: {
                name: "Preparatory",
                topics: [
                    {
                        id: "algebra",
                        title: "Basic Algebra",
                        description: "Introduction to variables and equations",
                        keyPoints: [
                            "Variables and expressions",
                            "Simple equations (x + a = b)",
                            "BODMAS order of operations",
                            "Like terms and simplification"
                        ],
                        examples: [
                            { q: "Solve: x + 5 = 12", a: "x = 7" },
                            { q: "Simplify: 2x + 3x", a: "2x + 3x = 5x" }
                        ],
                    }
                ],
            },
            3: {
                name: "Core",
                topics: [
                    {
                        id: "advanced-algebra",
                        title: "Advanced Algebra",
                        description: "Complex equations and mathematical relationships",
                        keyPoints: [
                            "Quadratic equations",
                            "Simultaneous equations",
                            "Inequalities",
                            "Functions and graphs"
                        ],
                        examples: [
                            { q: "Solve: x² - 5x + 6 = 0", a: "x = 2 or x = 3" },
                            { q: "Factor: x² - 9", a: "(x - 3)(x + 3)" }
                        ]
                    }
                ],
            },
            4: {
                name: "JAMB Mastery",
                topics: [
                    {
                        id: "functions",
                        title: "Functions and Calculus Basics",
                        description: "Introduction to functions and basic calculus concepts",
                        keyPoints: [
                            "Domain and range",
                            "Function notation",
                            "Limits and continuity",
                            "Basic differentiation"
                        ],
                        examples: [
                            { q: "If f(x) = 2x + 1, find f(3)", a: "f(3) = 2(3) + 1 = 7" },
                            { q: "Find domain of f(x) = 1/(x-2)", a: "All real numbers except x = 2" }
                        ]
                    }
                ],
            }
        ]
    },
    physics: {
        id: "physics",
        name: "Physics",
        icon: "⚡",
        color: "#059669",
        light: "#ECFDF5",
        border: "#A7F3D0",
        levels: {
            1: {
                name: "Foundation",
                topics: [
                    {
                        id: "basics",
                        title: "What is Physics?",
                        description: "Understanding the nature and scope of physics",
                        keyPoints: [
                            "SI units and measurements",
                            "Physical quantities and units",
                            "Scientific notation",
                            "Accuracy and precision"
                        ],
                        examples: [
                            { q: "Convert 2.5 km to meters", a: "2.5 km = 2500 m" },
                            { q: "Write 0.0034 in scientific notation", a: "3.4 × 10⁻³" }
                        ]
                    }
                ],
            },
            2: {
                name: "Preparatory",
                topics: [
                    {
                        id: "motion",
                        title: "Motion and Forces",
                        description: "Understanding how objects move and why",
                        keyPoints: [
                            "Speed, velocity, acceleration",
                            "Newton's laws of motion",
                            "Force and mass",
                            "Friction and resistance"
                        ],
                        examples: [
                            { q: "Car travels 120 km in 2 hours", a: "Average speed = 60 km/h" },
                            { q: "Force = mass × acceleration", a: "F = ma" }
                        ]
                    }
                ],
            },
            3: {
                name: "Core",
                topics: [
                    {
                        id: "energy",
                        title: "Energy and Work",
                        description: "Understanding energy forms and work calculations",
                        keyPoints: [
                            "Kinetic and potential energy",
                            "Work-energy theorem",
                            "Power calculations",
                            "Energy conservation"
                        ],
                        examples: [
                            { q: "KE = ½mv²", a: "Kinetic energy = ½ × mass × velocity²" },
                            { q: "Power = Work/Time", a: "Power = energy transferred per unit time" }
                        ]
                    }
                ],
            },
            4: {
                name: "JAMB Mastery",
                topics: [
                    {
                        id: "electricity",
                        title: "Electricity and Magnetism",
                        description: "Advanced electrical concepts and applications",
                        keyPoints: [
                            "Ohm's law and circuits",
                            "Magnetic fields",
                            "Electromagnetic induction",
                            "AC and DC currents"
                        ],
                        examples: [
                            { q: "V = IR (Ohm's law)", a: "Voltage = Current × Resistance" },
                            { q: "Power = I²R", a: "Power = Current² × Resistance" }
                        ]
                    }
                ],
            }
        ]
    },
    chemistry: {
        id: "chemistry",
        name: "Chemistry",
        icon: "🧪",
        color: "#DC2626",
        light: "#FEF3C7",
        border: "#FCA5A5",
        levels: {
            1: {
                name: "Foundation",
                topics: [
                    {
                        id: "matter",
                        title: "States of Matter",
                        description: "Understanding solids, liquids, and gases",
                        keyPoints: [
                            "Solid, liquid, gas properties",
                            "Changes of state",
                            "Particle arrangement",
                            "Density and pressure"
                        ],
                        examples: [
                            { q: "Ice → Water", a: "Melting (solid to liquid)" },
                            { q: "Water → Steam", a: "Boiling (liquid to gas)" }
                        ]
                    }
                ],
            },
            2: {
                name: "Preparatory",
                topics: [
                    {
                        id: "atomic",
                        title: "Atomic Structure",
                        description: "Understanding atoms, elements, and periodic table",
                        keyPoints: [
                            "Protons, neutrons, electrons",
                            "Atomic number and mass",
                            "Periodic table trends",
                            "Isotopes and ions"
                        ],
                        examples: [
                            { q: "Carbon: 6 protons, 6 neutrons, 6 electrons", a: "Carbon-12 is most common" },
                            { q: "Period 2 has 2 elements", a: "Lithium (3) and Beryllium (4)" }
                        ]
                    }
                ],
            },
            3: {
                name: "Core",
                topics: [
                    {
                        id: "bonding",
                        title: "Chemical Bonding",
                        description: "How atoms combine to form compounds",
                        keyPoints: [
                            "Ionic and covalent bonds",
                            "Lewis structures",
                            "Molecular geometry",
                            "Polarity and intermolecular forces"
                        ],
                        examples: [
                            { q: "NaCl: Na⁺ + Cl⁻", a: "Ionic bond through electron transfer" },
                            { q: "H₂O: covalent sharing", a: "Water molecules share electrons" }
                        ]
                    }
                ],
            },
            4: {
                name: "JAMB Mastery",
                topics: [
                    {
                        id: "equilibrium",
                        title: "Chemical Equilibrium",
                        description: "Balanced reactions and equilibrium concepts",
                        keyPoints: [
                            "Equilibrium constant (K)",
                            "Le Chatelier's principle",
                            "Acid-base equilibrium",
                            "Solubility equilibrium"
                        ],
                        examples: [
                            { q: "N₂ + 3H₂ ⇌ 2NH₃", a: "Haber process equilibrium" },
                            { q: "K = [products]/[reactants]", a: "Equilibrium constant expression" }
                        ]
                    }
                ],
            }
        ]
    },
    english: {
        id: "english",
        name: "English Language",
        icon: "📝",
        color: "#7C3AED",
        light: "#EDE9FE",
        border: "#BBF7D0",
        levels: {
            1: {
                name: "Foundation",
                topics: [
                    {
                        id: "alphabet",
                        title: "Alphabet and Phonics",
                        description: "Understanding letters, sounds, and basic reading",
                        keyPoints: [
                            "Letter recognition",
                            "Phonetic sounds",
                            "Sight words",
                            "Basic pronunciation"
                        ],
                        examples: [
                            { q: "A makes 'æ' sound in", a: "cat, hat, man" },
                            { q: "Silent 'e' rule", a: "like in 'cake', 'make', 'take'" }
                        ]
                    }
                ],
            },
            2: {
                name: "Preparatory",
                topics: [
                    {
                        id: "grammar",
                        title: "Basic Grammar",
                        description: "Understanding sentence structure and parts of speech",
                        keyPoints: [
                            "Nouns, verbs, adjectives",
                            "Subject-verb agreement",
                            "Tenses (past, present, future)",
                            "Punctuation rules"
                        ],
                        examples: [
                            { q: "The cat sits", a: "Subject: cat, Verb: sits" },
                            { q: "I walked home", a: "Past tense of walk" }
                        ]
                    }
                ],
            },
            3: {
                name: "Core",
                topics: [
                    {
                        id: "comprehension",
                        title: "Reading Comprehension",
                        description: "Understanding and analyzing written passages",
                        keyPoints: [
                            "Main idea identification",
                            "Supporting details",
                            "Making inferences",
                            "Author's purpose"
                        ],
                        examples: [
                            { q: "Main idea: 'The sun rises in the east'", a: "Earth's rotation causes apparent sunrise" },
                            { q: "Inference: 'Dark clouds'", a: "Rain might be coming" }
                        ]
                    }
                ],
            },
            4: {
                name: "JAMB Mastery",
                topics: [
                    {
                        id: "summary",
                        title: "Summary Writing",
                        description: "Condensing information and advanced analysis",
                        keyPoints: [
                            "Identifying main points",
                            "Concise language",
                            "Proper citation",
                            "Avoiding plagiarism"
                        ],
                        examples: [
                            { q: "Summary of 3 points in 1 sentence", a: "The study showed improved test scores, attendance, and engagement." },
                            { q: "Cite sources properly", a: "According to Smith (2023), 75% of students..." }
                        ]
                    }
                ],
            }
        ]
    }
};

// Helper Functions
function makeLessonId(subjectId, topicId) {
    return `${subjectId}_${topicId}`;
}

function getSubjectProgress(subjectId) {
    if (!userProgress[subjectId]) {
        return { completed: 0, total: 0, percentage: 0 };
    }
    
    const subject = CURRICULUM[subjectId];
    const totalTopics = Object.values(subject.levels).reduce((sum, level) => sum + level.topics.length, 0);
    const completedTopics = Object.values(userProgress[subjectId] || {}).filter(topic => topic.completed).length;
    
    return {
        completed: completedTopics,
        total: totalTopics,
        percentage: Math.round((completedTopics / totalTopics) * 100)
    };
}

function getOverallProgress() {
    const subjects = Object.keys(CURRICULUM);
    const totalSubjects = subjects.length;
    const completedSubjects = subjects.filter(subjectId => {
        const progress = getSubjectProgress(subjectId);
        return progress.percentage === 100;
    }).length;
    
    return Math.round((completedSubjects / totalSubjects) * 100);
}

function isTopicUnlocked(subjectId, levelId, topicId) {
    // Level 1 topics are always unlocked
    if (levelId === 1) return true;
    
    const subject = CURRICULUM[subjectId];
    const level = subject.levels[levelId];
    if (!level) return false;
    
    const topicIndex = level.topics.findIndex(topic => topic.id === topicId);
    if (topicIndex === 0) return true; // First topic in level is always unlocked
    
    const previousTopic = level.topics[topicIndex - 1];
    const previousTopicProgress = userProgress[subjectId]?.[previousTopic.id];
    
    return previousTopicProgress?.completed || false;
}

function canAccessMockExam() {
    const subjects = Object.keys(CURRICULUM);
    
    for (const subjectId of subjects) {
        const subject = CURRICULUM[subjectId];
        const level4 = subject.levels[4];
        if (!level4) return false;
        
        for (const topic of level4.topics) {
            const topicProgress = userProgress[subjectId]?.[topic.id];
            if (!topicProgress?.completed) return false;
        }
    }
    
    return true;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Screen Rendering Functions
function renderHomeScreen() {
    const subjects = Object.keys(CURRICULUM);
    const overallProgress = getOverallProgress();
    const allSubjectsComplete = overallProgress === 100;
    
    // Update progress displays
    subjects.forEach(subjectId => {
        const progress = getSubjectProgress(subjectId);
        const progressBar = elements.subjectsGrid.querySelector(`[data-subject="${subjectId}"] .progress-fill`);
        const progressText = elements.subjectsGrid.querySelector(`[data-subject="${subjectId}"] .progress-text`);
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progress.percentage}%`;
            progressText.textContent = `${progress.percentage}%`;
        }
    });
    
    // Update overall progress
    if (elements.overallProgress) {
        elements.subjectsCompleted.textContent = `${allSubjectsComplete ? 4 : 0}/4`;
        elements.progressMessage.textContent = allSubjectsComplete 
            ? "🎉 Congratulations! You've completed all subjects. Mock exam unlocked!"
            : "Start with Mathematics Foundation level to begin your JAMB journey!";
    }
}

function renderSubjectScreen(subjectId) {
    const subject = CURRICULUM[subjectId];
    const subjectProgress = getSubjectProgress(subjectId);
    
    // Update header
    elements.topicTitle.textContent = subject.name;
    elements.subjectIcon.textContent = subject.icon;
    elements.topicLevelInfo.textContent = "Level 1: Foundation";
    
    // Render levels
    const levelsContainer = elements.subjectsGrid.querySelector(`[data-subject="${subjectId}"] .subject-levels`);
    levelsContainer.innerHTML = '';
    
    Object.values(subject.levels).forEach((level, levelId) => {
        const isUnlocked = levelId === 1 || subjectProgress.percentage > 0;
        const levelProgress = userProgress[subjectId]?.[`level_${levelId}`] || { completed: false };
        
        levelsContainer.innerHTML += `
            <div class="level-card" data-level="${levelId}">
                <h3>Level ${levelId}: ${level.name}</h3>
                <p>${level.description}</p>
                <div class="level-status" id="${subjectId}-level-${levelId}">${isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}</div>
            </div>
        `;
    });
}

function renderTopicScreen(subjectId, levelId, topicId) {
    const subject = CURRICULUM[subjectId];
    const level = subject.levels[levelId];
    const topic = level.topics.find(t => t.id === topicId);
    const nextTopic = getNextTopic(subjectId, levelId, topicId, progress);
    
    if (!topic) return;
    
    // Update header
    elements.topicTitle.textContent = topic.title;
    elements.subjectIcon.textContent = subject.icon;
    elements.topicLevelInfo.textContent = `Level ${levelId}: ${level.name}`;
    
    // Render step indicators
    const learnDot = elements.learnStep.querySelector('#learn-dot');
    const learnLine = elements.learnStep.querySelector('#learn-line');
    const practiceDot = elements.learnStep.querySelector('#practice-dot');
    const practiceLine = elements.learnStep.querySelector('#practice-line');
    const testDot = elements.learnStep.querySelector('#test-dot');
    const testLine = elements.learnStep.querySelector('#test-line');
    
    learnDot.classList.toggle('active', topicStep === 'learn');
    learnLine.classList.toggle('active', topicStep === 'learn');
    practiceDot.classList.toggle('active', topicStep === 'practice');
    practiceLine.classList.toggle('active', topicStep === 'practice');
    testDot.classList.toggle('active', topicStep === 'test');
    testLine.classList.toggle('active', topicStep === 'test');
    
    // Render content based on step
    const learnContent = elements.learnContent;
    const practiceContent = elements.practiceContent;
    const testContent = elements.testContent;
    
    if (topicStep === 'learn') {
        learnContent.style.display = 'block';
        practiceContent.style.display = 'none';
        testContent.style.display = 'none';
        
        // Render key points
        if (elements.keyPointsList) {
            elements.keyPointsList.innerHTML = topic.learn.keyPoints.map(point => 
                `<li>${point}</li>`
            ).join('');
        }
        
        // Render examples
        if (elements.examplesList && topic.learn.examples) {
            elements.examplesList.innerHTML = topic.learn.examples.map(example => 
                `<div>
                    <p><strong>Q: ${example.q}</strong></p>
                    <p><strong>→ ${example.a}</strong></p>
                </div>`
            ).join('');
        }
        
        // Render YouTube link
        if (elements.youtubeLink) {
            elements.youtubeLink.href = `https://www.youtube.com/results?search_query=JAMB+${subject.name}+${topic.title}`;
        }
        
        elements.startPracticeBtn.style.display = 'block';
    } else if (topicStep === 'practice') {
        learnContent.style.display = 'none';
        practiceContent.style.display = 'block';
        testContent.style.display = 'none';
        
        elements.startTestBtn.style.display = 'block';
    } else if (topicStep === 'test') {
        learnContent.style.display = 'none';
        practiceContent.style.display = 'none';
        testContent.style.display = 'block';
        
        elements.startTestBtn.style.display = 'none';
        elements.submitTestBtn.style.display = 'block';
    }
}

function renderTestResults(score, passed, subjectId, levelId, topicId, nextTopic) {
    elements.resultIcon.textContent = passed ? '🏆' : '📚';
    elements.resultTitle.textContent = passed ? 'Test Passed! 🎉' : 'Not Yet — Keep Going!';
    elements.resultScore.textContent = `${score}%`;
    elements.resultMessage.textContent = passed 
        ? `Excellent work! You've mastered ${topic.title}. Next topic unlocked! 🚀`
        : `You scored ${score}%. Review the material and try again. 💪`;
    
    elements.nextTopicBtn.style.display = passed && nextTopic ? 'block' : 'none';
    elements.retryTestBtn.style.display = !passed ? 'block' : 'none';
}

function renderMockExam() {
    elements.mockTimer.textContent = formatTime(mockTimeLeft);
    elements.mockQuestionsContainer.innerHTML = '';
    
    // Generate mock questions
    const allQuestions = [];
    const subjects = Object.keys(CURRICULUM);
    
    subjects.forEach(subjectId => {
        const subject = CURRICULUM[subjectId];
        const level4 = subject.levels[4];
        
        level4.topics.forEach(topic => {
            const questions = topic.test.map(q => ({
                ...q,
                subject: subject.name,
                topic: topic.title,
                id: Math.random().toString(36).substr(2, 9)
            }));
            
            allQuestions.push(...questions);
        });
    });
    
    // Shuffle and select questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 60 + Math.floor(Math.random() * 41));
    
    // Render questions
    elements.mockQuestionsContainer.innerHTML = selectedQuestions.map((q, index) => `
        <div class="question-option" data-question-id="${q.id}">
            <p><strong>Question ${index + 1}</strong></p>
            <p>${q.q}</p>
            <div class="answer-options">
                ${q.options.map((option, optIndex) => `
                    <div class="answer-option" data-option="${optIndex}">
                        <span>A${String.fromCharCode(65 + optIndex)}.</span> ${option}
                    </div>
                `).join('')}
            </div>
    `).join('');
}

// Event Handlers
function handleSubjectClick(subjectId) {
    const isUnlocked = subjectId === 'mathematics' || getSubjectProgress(subjectId).percentage > 0;
    
    if (!isUnlocked) {
        alert('Complete Mathematics Foundation level to unlock this subject!');
        return;
    }
    
    selectedSubject = subjectId;
    selectedLevel = 1;
    selectedTopic = null;
    topicStep = 'learn';
    showScreen('subject');
}

function handleTopicClick(subjectId, levelId, topicId) {
    const isUnlocked = isTopicUnlocked(subjectId, levelId, topicId);
    
    if (!isUnlocked) {
        alert('Complete previous topic to unlock this one!');
        return;
    }
    
    selectedSubject = subjectId;
    selectedLevel = levelId;
    selectedTopic = topicId;
    topicStep = 'learn';
    showScreen('topic');
}

function handleBackToSubject() {
    selectedSubject = null;
    selectedLevel = null;
    selectedTopic = null;
    topicStep = 'learn';
    showScreen('home');
}

function handleStartPractice() {
    topicStep = 'practice';
    showScreen('topic');
}

function handleStartTest() {
    topicStep = 'test';
    showScreen('topic');
}

function handlePracticeAnswer(questionId, optionIndex) {
    practiceAnswers[questionId] = optionIndex;
    
    // Update UI to show selected answer
    const practiceQuestions = elements.practiceQuestions.querySelectorAll('.question-option');
    practiceQuestions.forEach((questionEl, index) => {
        if (index === questionId) {
            questionEl.classList.add('selected');
            questionEl.style.borderColor = '#2563eb';
            questionEl.style.background = '#2563eb';
            questionEl.style.fontWeight = '600';
        } else {
            questionEl.classList.remove('selected');
            questionEl.style.borderColor = '#e2e8f0';
            questionEl.style.background = '#F8FAFC';
            questionEl.style.fontWeight = '400';
        }
    });
}

function handleTestAnswer(questionId, optionIndex) {
    testAnswers[questionId] = optionIndex;
}

function handleTestSubmit() {
    const questions = elements.testQuestions.querySelectorAll('.question-option');
    let correct = 0;
    
    questions.forEach((questionEl, index) => {
        const questionId = questionEl.getAttribute('data-question-id');
        const selectedAnswer = testAnswers[questionId];
        
        if (selectedAnswer === question.options.findIndex(opt => opt === selectedAnswer)) {
            correct++;
            questionEl.classList.add('correct');
            questionEl.style.background = '#D1FAE5';
            questionEl.style.borderColor = '#059669';
            questionEl.style.color = '#059669';
        } else {
            questionEl.classList.add('incorrect');
            questionEl.style.background = '#FEE2E2';
            questionEl.style.borderColor = '#EF4444';
            questionEl.style.color = '#EF4444';
        }
    });
    
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;
    
    // Hide test questions and show results
    elements.testQuestions.style.display = 'none';
    elements.testContent.style.display = 'block';
    elements.testActions.style.display = 'block';
    
    renderTestResults(score, passed, selectedSubject, selectedLevel, selectedTopic, getNextTopic(selectedSubject, selectedLevel, selectedTopic, userProgress));
}

function handleMockSubmit() {
    const questions = elements.mockQuestionsContainer.querySelectorAll('.question-option');
    let correct = 0;
    
    questions.forEach((questionEl, index) => {
        const questionId = questionEl.getAttribute('data-question-id');
        const selectedAnswer = mockAnswers[questionId];
        
        if (selectedAnswer === questionEl.getAttribute('data-option')) {
            correct++;
        }
    });
    
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;
    
    // Hide mock questions and show results
    elements.mockQuestionsContainer.style.display = 'none';
    elements.mockActions.style.display = 'block';
    
    alert(`Mock Exam Complete! Score: ${score}% (${passed ? 'PASSED' : 'FAILED'})`);
    
    // Return to dashboard after delay
    setTimeout(() => {
        mockSubmitted = true;
        mockMode = false;
        showScreen('home');
    }, 2000);
}

function handleStartMock() {
    mockMode = true;
    mockTimeLeft = 120 * 60;
    mockSubmitted = false;
    mockAnswers = {};
    showScreen('mock');
}

function handleMockAnswer(questionId, optionIndex) {
    mockAnswers[questionId] = optionIndex;
    
    // Update UI to show selected answer
    const questions = elements.mockQuestionsContainer.querySelectorAll('.question-option');
    questions.forEach((questionEl, index) => {
        if (index === questionId) {
            questionEl.classList.add('selected');
            questionEl.style.borderColor = '#10b981';
            questionEl.style.background = '#D1FAE5';
        } else {
            questionEl.classList.remove('selected');
            questionEl.style.borderColor = '#e2e8f0';
            questionEl.style.background = '#F8FAFC';
        }
    });
}

function handleBackToDashboard() {
    mockMode = false;
    showScreen('home');
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
        showLoginError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showLoginError('Password must be at least 6 characters');
        return;
    }
    
    showLoading(true);
    
    try {
        const result = await SupabaseClient.signUp(email, password, name);
        
        if (result.success) {
            showLoginSuccess('Account created successfully! Please check your email to verify your account.');
            // Clear form
            document.getElementById('signup-name').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';
            // Switch to login form
            toggleToLogin();
        } else {
            showLoginError(result.error);
        }
    } catch (error) {
        showLoginError('Registration failed. Please try again.');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await SupabaseClient.signOut();
        currentUser = null;
        userProgress = {};
        showScreen('home');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Initialize App
function initApp() {
    loadProgress();
    renderHomeScreen();
    
    // Set up event listeners
    elements.subjectsGrid.addEventListener('click', (e) => {
        const subjectCard = e.target.closest('[data-subject]');
        if (subjectCard) {
            const subjectId = subjectCard.getAttribute('data-subject');
            handleSubjectClick(subjectId);
        }
    });
    
    elements.userMenuBtn.addEventListener('click', () => {
        if (currentUser) {
            alert('User profile feature coming soon!');
        } else {
            showScreen('auth');
        }
    });
    
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    elements.toggleToSignup.addEventListener('click', () => showAuthForm('signup'));
    elements.toggleToLogin.addEventListener('click', () => showAuthForm('login'));
    
    // Auth forms
    elements.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = elements.loginEmail.value;
        const password = elements.loginPassword.value;
        handleLogin(email, password);
    });
    
    elements.signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = elements.signupName.value;
        const email = elements.signupEmail.value;
        const password = elements.signupPassword.value;
        const confirmPassword = elements.signupConfirm.value;
        handleSignup(name, email, password, confirmPassword);
    });
    
    // Topic navigation
    elements.topicBackBtn.addEventListener('click', handleBackToSubject);
    elements.startPracticeBtn.addEventListener('click', handleStartPractice);
    elements.startTestBtn.addEventListener('click', handleStartTest);
    elements.backToPracticeBtn.addEventListener('click', () => {
        topicStep = 'practice';
        showScreen('topic');
    });
    elements.submitTestBtn.addEventListener('click', handleTestSubmit);
    
    // Mock exam
    elements.mockExamAccess.addEventListener('click', () => {
        if (canAccessMockExam()) {
            handleStartMock();
        } else {
            alert('Complete all Level 4 topics to unlock Mock Exam!');
        }
    });
    
    elements.submitMockBtn.addEventListener('click', handleMockSubmit);
    elements.backToDashboardBtn.addEventListener('click', handleBackToDashboard);
}

// Start the application
document.addEventListener('DOMContentLoaded', initApp);
