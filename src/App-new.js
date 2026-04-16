import { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { getProgress as fetchProgressFromDb, saveProgress as saveProgressToDb, saveTestResult } from "./supabase";
import { CURRICULUM, getSubjectById, getLevelById, getTopicById, getSubjectProgress, getNextTopic, isTopicUnlocked, canAccessMockExam } from "./curriculum";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── GOOGLE FONTS ─────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #F0F4FF; color: #1a1a2e; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse-ring { 0% { box-shadow: 0 0 0 rgba(37,99,235,0.4); } 70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    .fade-in { animation: fadeIn 0.4s ease forwards; }
    .slide-in { animation: slideIn 0.3s ease forwards; }
    .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
    .btn-primary { transition: all 0.2s ease; }
    .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.08); }
    .btn-primary:active { transform: translateY(0); }
    .progress-bar { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
    .lock-shake:hover { animation: shake 0.4s ease; }
    @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
    .star-burst { animation: countUp 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
    .confetti { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; }
  `}</style>
);

// ─── ICON COMPONENTS ─────────────────────────────────────────────────────
const Icon = {
  Back: () => <span style={{ fontSize: 20 }}>←</span>,
  Next: () => <span style={{ fontSize: 20 }}>→</span>,
  Book: () => <span style={{ fontSize: 16 }}>📖</span>,
  YouTube: () => <span style={{ fontSize: 16 }}>▶️</span>,
  Retry: () => <span style={{ fontSize: 16 }}>🔄</span>,
  Lock: () => <span style={{ fontSize: 20 }}>🔒</span>,
  Unlock: () => <span style={{ fontSize: 20 }}>🔓</span>,
  Check: () => <span style={{ fontSize: 16 }}>✅</span>,
  Star: () => <span style={{ fontSize: 20 }}>⭐</span>,
  Trophy: () => <span style={{ fontSize: 24 }}>🏆</span>,
  Target: () => <span style={{ fontSize: 20 }}>🎯</span>,
  Clock: () => <span style={{ fontSize: 16 }}>⏰</span>,
  Users: () => <span style={{ fontSize: 16 }}>👥</span>,
  Chart: () => <span style={{ fontSize: 16 }}>📊</span>,
  Settings: () => <span style={{ fontSize: 16 }}>⚙️</span>,
  Logout: () => <span style={{ fontSize: 16 }}>🚪</span>,
  Arrow: () => <span style={{ fontSize: 12 }}>▸</span>,
};

// ─── PROGRESS HELPERS ─────────────────────────────────────────────────────
const makeLessonId = (subjectId, topicId) => `${subjectId}_${topicId}`;

const loadLocalProgress = () => {
  try {
    const saved = localStorage.getItem('jambProgress');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveLocalProgress = (progress) => {
  try {
    localStorage.setItem('jambProgress', JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress locally:', error);
  }
};

const normalizeProgressData = (data) => {
  if (!data || !Array.isArray(data)) return {};
  
  const normalized = {};
  data.forEach(item => {
    const [subjectId, topicId] = item.lesson_id.split('_');
    if (!normalized[subjectId]) normalized[subjectId] = {};
    normalized[subjectId][topicId] = {
      completed: item.completed,
      score: item.score,
      status: item.completed ? 'passed' : 'in_progress'
    };
  });
  
  return normalized;
};

// Main App wrapper with authentication and routing
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </Router>
  );
}

// App component that uses authentication
function AppWithAuth() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState("home");
  const [progress, setProgress] = useState(loadLocalProgress());
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicStep, setTopicStep] = useState("learn");
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [testAnswers, setTestAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockTimeLeft, setMockTimeLeft] = useState(120 * 60);

  useEffect(() => {
    let mounted = true;
    if (!user?.id) return;

    const loadDbProgress = async () => {
      try {
        const { data, error } = await fetchProgressFromDb(user.id);
        if (error) throw error;
        if (!mounted) return;
        const merged = normalizeProgressData(data);
        setProgress(merged);
        saveLocalProgress(merged);
      } catch (error) {
        console.error('Error loading Supabase progress:', error);
      }
    };

    loadDbProgress();
    return () => { mounted = false; };
  }, [user?.id]);

  useEffect(() => {
    saveLocalProgress(progress);
  }, [progress]);

  const getSubjectProgress = useCallback((subjectId) => {
    return getSubjectProgress(subjectId, progress);
  }, [progress]);

  const overallProgress = useMemo(() => {
    const subjects = Object.keys(CURRICULUM);
    return Math.round(subjects.reduce((sum, subjectId) => sum + getSubjectProgress(subjectId).percentage, 0) / subjects.length);
  }, [progress]);

  const allSubjectsComplete = useMemo(() => {
    return Object.keys(CURRICULUM).every(subjectId => getSubjectProgress(subjectId).percentage === 100);
  }, [progress]);

  const handleTopicSelect = (subjectId, levelId, topicId) => {
    setSelectedSubject(subjectId);
    setSelectedLevel(levelId);
    setSelectedTopic(topicId);
    setTopicStep("learn");
    setPracticeAnswers({});
    setTestAnswers({});
    setShowFeedback({});
    setTestSubmitted(false);
  };

  const handleTestSubmit = useCallback(async () => {
    const topic = getTopicById(selectedSubject, selectedLevel, selectedTopic);
    if (!topic || !user?.id) return;

    const questions = topic.test;
    let correct = 0;
    questions.forEach((q, i) => {
      if (testAnswers[i] === q.answer) correct++;
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;
    const lessonId = makeLessonId(selectedSubject, selectedTopic);

    try {
      // Save test result
      await saveTestResult(user.id, CURRICULUM[selectedSubject].name, topic.title, score, passed);
      
      // Update progress
      await saveProgressToDb({ userId: user.id, lessonId, completed: passed });
      
      // Update local state
      setProgress(prev => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          [selectedTopic]: {
            completed: passed,
            score: passed ? score : prev[selectedSubject]?.[selectedTopic]?.score || 0
          }
        }
      }));

      setTestSubmitted(true);
      setShowConfetti(passed);

    } catch (error) {
      console.error('Error saving test result:', error);
    }
  };

  const handleBack = () => {
    if (topicStep === "test" && testSubmitted) {
      setTopicStep("learn");
    } else {
      setSelectedSubject(null);
      setSelectedLevel(null);
      setSelectedTopic(null);
      setScreen("home");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setScreen("home");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ─── HOME SCREEN ─────────────────────────────────────────────────────
  if (screen === "home") {
    const subjects = Object.keys(CURRICULUM);
    
    return (
      <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'DM Sans', sans-serif" }}>
        <FontLoader/>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ 
              fontFamily: "'Sora', sans-serif", 
              fontSize: 48, 
              fontWeight: 800, 
              marginBottom: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              padding: '20px 40px',
              borderRadius: '16px'
            }}>
              JAMB SUCCESS
            </h1>
            <p style={{ fontSize: 20, color: '#64748b', maxWidth: 600, margin: '0 auto 16px' }}>
              Complete JAMB preparation with structured learning paths
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px',
            marginBottom: '40px'
          }}>
            {subjects.map(subjectId => {
              const subject = CURRICULUM[subjectId];
              const subjectProgress = getSubjectProgress(subjectId);
              const isUnlocked = subjectProgress.percentage > 0 || subjectId === 'mathematics';
              
              return (
                <div
                  key={subjectId}
                  onClick={() => isUnlocked ? setSelectedSubject(subjectId) : null}
                  className="fade-in card-hover"
                  style={{
                    background: isUnlocked ? subject.color : '#e2e8f0',
                    borderRadius: 20,
                    padding: '32px',
                    textAlign: 'center',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    boxShadow: isUnlocked ? '0 8px 32px rgba(0,0,0,0.12)' : 'none',
                    transition: 'all 0.3s ease',
                    border: isUnlocked ? `2px solid ${subject.border}` : '2px dashed #cbd5e1'
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{subject.emoji}</div>
                  <h3 style={{ 
                    fontFamily: "'Sora', sans-serif", 
                    fontSize: 24, 
                    fontWeight: 700, 
                    color: isUnlocked ? '#1a1a2e' : '#9ca3af',
                    marginBottom: 8 
                  }}>
                    {subject.name}
                  </h3>
                  
                  {isUnlocked ? (
                    <div style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                      Progress: {subjectProgress.percentage}%
                    </div>
                  ) : (
                    <div style={{ color: '#9ca3af', fontSize: 14 }}>
                      <Icon.Lock />
                      <div style={{ marginTop: 8 }}>Complete Mathematics to unlock</div>
                    </div>
                  )}
                  
                  <div style={{ 
                    width: '100%', 
                    height: 8, 
                    background: '#e2e8f0', 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${subjectProgress.percentage}%`, 
                      height: '100%', 
                      background: subject.color,
                      borderRadius: 4,
                      transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {allSubjectsComplete && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                onClick={() => setScreen("mock")}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 50,
                  padding: '16px 32px',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <Icon.Target /> Start Mock Exam
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── SUBJECT SCREEN ─────────────────────────────────────────────────────
  if (screen === "subject") {
    const subject = CURRICULUM[selectedSubject];
    const subjectProgress = getSubjectProgress(selectedSubject);
    
    return (
      <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'DM Sans', sans-serif" }}>
        <FontLoader/>
        <div style={{ 
          background: `linear-gradient(135deg, ${subject.color}dd, ${subject.color})`,
          color: '#fff',
          padding: '40px 20px 24px'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: 50,
                  padding: '12px 20px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Icon.Back /> Back to Dashboard
              </button>
              
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                  {subject.emoji} {subject.name}
                </h2>
                <div style={{ 
                  width: 200, 
                  height: 8, 
                  background: 'rgba(255,255,255,0.3)', 
                  borderRadius: 4,
                  marginTop: 8
                }}>
                  <div style={{ 
                    width: `${subjectProgress.percentage}%`, 
                    height: '100%', 
                    background: '#fff', 
                    borderRadius: 4,
                    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
                  }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              {Object.values(subject.levels).map(level => (
                <div key={level.id} style={{ 
                  background: '#fff', 
                  borderRadius: 16, 
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ 
                    fontFamily: "'Sora', sans-serif", 
                    fontSize: 20, 
                    fontWeight: 700, 
                    marginBottom: 16,
                    color: subject.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span>Level {level.id}</span>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 400, 
                      color: '#64748b'
                    }}>
                      {level.name}
                    </div>
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {level.topics.map(topic => {
                      const isTopicUnlocked = isTopicUnlocked(selectedSubject, level.id, topic.id);
                      const topicProgress = progress[selectedSubject]?.[topic.id];
                      
                      return (
                        <div
                          key={topic.id}
                          onClick={() => isTopicUnlocked ? handleTopicSelect(selectedSubject, level.id, topic.id) : null}
                          className="fade-in card-hover"
                          style={{
                            background: isTopicUnlocked ? '#fff' : '#f8fafc',
                            borderRadius: 12,
                            padding: '20px',
                            cursor: isTopicUnlocked ? 'pointer' : 'not-allowed',
                            border: isTopicUnlocked ? `2px solid ${subject.border}` : '2px dashed #cbd5e1',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {!isTopicUnlocked && <Icon.Lock />}
                              <h4 style={{ 
                                fontFamily: "'Sora', sans-serif", 
                                fontSize: 16, 
                                fontWeight: 600, 
                                color: isTopicUnlocked ? subject.color : '#9ca3af',
                                margin: 0
                              }}>
                                {topic.title}
                              </h4>
                            </div>
                            
                            {topicProgress?.completed && (
                              <div style={{ 
                                background: subject.color, 
                                color: '#fff', 
                                borderRadius: 20, 
                                width: 32, 
                                height: 32, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: 16
                              }}>
                                <Icon.Check />
                              </div>
                            )}
                          </div>
                          
                          {!isTopicUnlocked && (
                            <div style={{ 
                              position: 'absolute', 
                              top: 12, 
                              right: 12, 
                              fontSize: 12, 
                              color: '#9ca3af',
                              fontWeight: 500
                            }}>
                              Complete previous topic to unlock
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── TOPIC SCREEN ─────────────────────────────────────────────────────
  if (screen === "topic") {
    const subject = CURRICULUM[selectedSubject];
    const level = getLevelById(selectedSubject, selectedLevel);
    const topic = getTopicById(selectedSubject, selectedLevel, selectedTopic);
    const nextTopic = getNextTopic(selectedSubject, selectedLevel, selectedTopic, progress);
    
    if (!topic) return null;

    return (
      <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'DM Sans', sans-serif" }}>
        <FontLoader/>
        
        {/* LEARN STEP */}
        {topicStep === "learn" && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
            <div style={{ 
              background: `linear-gradient(135deg, ${subject.color}dd, ${subject.color})`,
              color: '#fff',
              padding: '20px 24px',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <button
                  onClick={handleBack}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: 50,
                    padding: '12px 20px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Icon.Back /> Back to {subject.name}
                </button>
                
                <h2 style={{ 
                  fontFamily: "'Sora', sans-serif", 
                  fontSize: 24, 
                  fontWeight: 700, 
                  marginBottom: 16,
                  textAlign: 'center'
                }}>
                  {topic.title}
                </h2>
              </div>
            </div>

            <div className="fade-in" style={{ 
              background: '#fff', 
              borderRadius: 18, 
              padding: '32px', 
              marginBottom: 16,
              boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontFamily: "'Sora', sans-serif", 
                fontSize: 20, 
                fontWeight: 600, 
                marginBottom: 16,
                color: subject.color
              }}>
                📖 Learn
              </h3>
              
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: '#374151', marginBottom: 16 }}>
                  {topic.learn.overview}
                </p>
                
                {topic.learn.keyPoints && (
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ 
                      fontFamily: "'Sora', sans-serif", 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 12,
                      color: '#1a1a2e'
                    }}>
                      🔑 Key Points
                    </h4>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0,
                      margin: 0
                    }}>
                      {topic.learn.keyPoints.map((point, i) => (
                        <li key={i} style={{ 
                          marginBottom: 8, 
                          paddingLeft: 20, 
                          position: 'relative',
                          fontSize: 15,
                          color: '#374151'
                        }}>
                          <span style={{ 
                            position: 'absolute', 
                            left: 0, 
                            color: subject.color,
                            fontWeight: 600
                          }}>
                            •
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {topic.learn.examples && (
                  <div style={{ marginBottom: 24 }}>
                    <h4 style={{ 
                      fontFamily: "'Sora', sans-serif", 
                      fontSize: 18, 
                      fontWeight: 600, 
                      marginBottom: 12,
                      color: '#1a1a2e'
                    }}>
                      💡 Worked Examples
                    </h4>
                    {topic.learn.examples.map((example, i) => (
                      <div key={i} style={{ 
                        marginBottom: 14, 
                        padding: 16, 
                        background: '#F8FAFC', 
                        borderRadius: 12,
                        border: `1px solid ${subject.border}`
                      }}>
                        <p style={{ 
                          fontWeight: 600, 
                          color: '#374151', 
                          marginBottom: 8,
                          fontSize: 15
                        }}>
                          Q: {example.q}
                        </p>
                        <p style={{ 
                          color: subject.color, 
                          fontWeight: 600, 
                          fontSize: 15
                        }}>
                          → {example.a}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <a
                    href={`https://www.youtube.com/results?search_query=JAMB+${subject.name}+${topic.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: '#EF4444',
                      color: '#fff',
                      borderRadius: 14,
                      padding: '16px 20px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
                    }}
                  >
                    <Icon.YouTube />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Watch on YouTube</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>JAMB {subject.name} — {topic.title} tutorials</div>
                    </div>
                    <Icon.Arrow />
                  </a>
                </div>

                <button
                  onClick={() => setTopicStep("practice")}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${subject.color}, ${subject.color}bb)`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 50,
                    padding: '16px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Start Practice →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* PRACTICE STEP */}
        {topicStep === "practice" && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
            <div style={{ 
              background: `linear-gradient(135deg, ${subject.color}dd, ${subject.color})`,
              color: '#fff',
              padding: '20px 24px',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <button
                  onClick={() => setTopicStep("learn")}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: 50,
                    padding: '12px 20px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Icon.Back /> Back to Learn
                </button>
                
                <h2 style={{ 
                  fontFamily: "'Sora', sans-serif", 
                  fontSize: 24, 
                  fontWeight: 700, 
                  marginBottom: 16,
                  textAlign: 'center'
                }}>
                  {topic.title} — Practice
                </h2>
              </div>
            </div>

            <div className="fade-in" style={{ 
              background: '#fff', 
              borderRadius: 18, 
              padding: '32px', 
              marginBottom: 16,
              boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontFamily: "'Sora', sans-serif", 
                fontSize: 20, 
                fontWeight: 600, 
                marginBottom: 16,
                color: subject.color
              }}>
                📝 Practice Mode
              </h3>
              
              <div style={{ marginBottom: 24 }}>
                {topic.practice.map((q, qi) => {
                  const selected = practiceAnswers[qi];
                  const revealed = showFeedback[qi];
                  const isCorrect = selected === q.answer;
                  
                  return (
                    <div key={qi} className="fade-in" style={{ 
                      background: '#fff', 
                      borderRadius: 18, 
                      padding: '20px', 
                      marginBottom: 16,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                      border: `2px solid ${revealed ? (isCorrect ? '#10b981' : '#ef4444') : subject.border}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ 
                          background: subject.light, 
                          color: subject.color, 
                          fontWeight: 800, 
                          fontSize: 13, 
                          padding: '3px 10px', 
                          borderRadius: 6
                        }}>
                          Q{qi + 1}
                        </span>
                        {revealed && (
                          <span style={{ 
                            color: isCorrect ? '#059669' : '#ef4444', 
                            fontWeight: 600, 
                            fontSize: 13
                          }}>
                            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
                          </span>
                        )}
                      </div>
                      <p style={{ 
                        fontWeight: 600, 
                        marginBottom: 12, 
                        fontSize: 15, 
                        lineHeight: 1.5
                      }}>
                        {q.q}
                      </p>
                      {q.options.map((opt, oi) => {
                        let bg = "#F8FAFC", border = "#e2e8f0", color = "#374151";
                        if (revealed) {
                          if (oi === q.answer) { bg = "#D1FAE5"; border = "#059669"; color = "#059669"; }
                          else if (oi === selected) { bg = "#FEE2E2"; border = "#ef4444"; color = "#ef4444"; }
                        }
                        
                        return (
                          <button
                            key={oi}
                            onClick={() => !revealed && setPracticeAnswers(p => ({ ...p, [qi]: oi }))}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 14px',
                              marginBottom: 8,
                              borderRadius: 10,
                              border: `2px solid ${border}`,
                              background: bg,
                              cursor: revealed ? 'default' : 'pointer',
                              fontSize: 14,
                              fontWeight: oi === selected || oi === q.answer ? 600 : 400,
                              color: color,
                              transition: 'all 0.15s'
                            }}
                          >
                            <span style={{ fontWeight: 700, marginRight: 8 }}>
                              {["A", "B", "C", "D"][oi]}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                      
                      {selected !== undefined && !revealed && (
                        <button
                          onClick={() => setShowFeedback(p => ({ ...p, [qi]: true }))}
                          style={{
                            background: subject.color,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 50,
                            padding: '8px 20px',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: 4
                          }}
                        >
                          Check Answer
                        </button>
                      )}
                      
                      {revealed && !isCorrect && (
                        <div style={{ 
                          background: '#EFF6FF', 
                          borderRadius: 10, 
                          padding: '10px 14px', 
                          marginTop: 8
                        }}>
                          <p style={{ 
                            color: '#2563EB', 
                            fontWeight: 600, 
                            fontSize: 13, 
                            marginBottom: 4
                          }}>
                            💡 Correct answer: {["A", "B", "C", "D"][q.answer]}. {q.options[q.answer]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setTopicStep("test")}
                className="btn-primary"
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${subject.color}, ${subject.color}bb)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 50,
                  padding: '16px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📝 Take the Test →
              </button>
            </div>
          </div>
        )}
        
        {/* TEST STEP */}
        {topicStep === "test" && !testSubmitted && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
            <div style={{ 
              background: "linear-gradient(135deg,#1a1a2e,#0f172a)",
              color: '#fff',
              padding: '20px 24px',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <button
                  onClick={() => setTopicStep("practice")}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: 50,
                    padding: '12px 20px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Icon.Back /> Back to Practice
                </button>
                
                <h2 style={{ 
                  fontFamily: "'Sora', sans-serif", 
                  fontSize: 24, 
                  fontWeight: 700, 
                  marginBottom: 16,
                  textAlign: 'center'
                }}>
                  {topic.title} — Test
                </h2>
              </div>
            </div>

            <div className="fade-in" style={{ 
              background: '#fff', 
              borderRadius: 18, 
              padding: '32px', 
              marginBottom: 16,
              boxShadow: '0 2px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                fontFamily: "'Sora', sans-serif", 
                fontSize: 20, 
                fontWeight: 600, 
                marginBottom: 16,
                color: subject.color
              }}>
                🎯 Test Mode
              </h3>
              
              <div style={{ marginBottom: 24 }}>
                {topic.test.map((q, qi) => {
                  const selected = testAnswers[qi];
                  
                  return (
                    <div key={qi} className="fade-in" style={{ 
                      background: '#fff', 
                      borderRadius: 18, 
                      padding: '20px', 
                      marginBottom: 16,
                      boxShadow: selected !== undefined ? `0 2px 12px rgba(0,0,0,0.12)` : '0 2px 12px rgba(0,0,0,0.1)',
                      border: selected !== undefined ? `2px solid ${subject.border}` : '2px solid #e2e8f0'
                    }}>
                      <p style={{ 
                        fontWeight: 600, 
                        marginBottom: 12, 
                        fontSize: 15, 
                        lineHeight: 1.5
                      }}>
                        Question {qi + 1}
                      </p>
                      <p style={{ 
                        fontSize: 16, 
                        marginBottom: 16, 
                        lineHeight: 1.5
                      }}>
                        {q.q}
                      </p>
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setTestAnswers(p => ({ ...p, [qi]: oi }))}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            marginBottom: 8,
                            borderRadius: 10,
                            border: `2px solid ${selected === oi ? subject.border : '#e2e8f0'}`,
                            background: selected === oi ? subject.light : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: selected === oi ? 600 : 400,
                            color: selected === oi ? subject.color : '#374151',
                            transition: 'all 0.15s'
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: 8 }}>
                            {["A", "B", "C", "D"][oi]}.
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div style={{ 
                background: '#fff', 
                borderRadius: 18, 
                padding: '20px', 
                marginBottom: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
              }}>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: 14, 
                  marginBottom: 16,
                  textAlign: 'center'
                }}>
                  Answered: {Object.keys(testAnswers).length} / {topic.test.length} questions
                </p>
                <button
                  onClick={handleTestSubmit}
                  disabled={Object.keys(testAnswers).length < topic.test.length}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    background: Object.keys(testAnswers).length >= topic.test.length 
                      ? `linear-gradient(135deg,#1a1a2e,${subject.color})` 
                      : "#e2e8f0",
                    color: Object.keys(testAnswers).length >= topic.test.length ? '#fff' : '#94a3b8',
                    border: 'none',
                    borderRadius: 50,
                    padding: '16px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: Object.keys(testAnswers).length >= topic.test.length ? 'pointer' : 'not-allowed'
                  }}
                >
                  🎯 Submit Test
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* TEST RESULT */}
        {topicStep === "test" && testSubmitted && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
            <div className="fade-in" style={{ 
              background: passed ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#DC2626,#EF4444)',
              color: '#fff',
              borderRadius: 24,
              padding: '32px',
              marginBottom: 16,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}>
              {showConfetti && <Confetti />}
              
              <div style={{ fontSize: 64, marginBottom: 8 }}>{passed ? <Icon.Trophy /> : <Icon.Book />}</div>
              <h2 style={{ 
                fontFamily: "'Sora', sans-serif", 
                fontSize: 28, 
                fontWeight: 800, 
                marginBottom: 4
              }}>
                {passed ? "Test Passed! 🎉" : "Not Yet — Keep Going!"}
              </h2>
              <div style={{ fontSize: 56, fontWeight: 700, marginBottom: 16 }}>
                {progress[selectedSubject]?.[selectedTopic]?.score || 0}%
              </div>
              <p style={{ 
                fontSize: 16, 
                color: 'rgba(255,255,255,0.85)', 
                marginBottom: 24
              }}>
                {passed 
                  ? `Excellent work! You've mastered ${topic.title}. Next topic unlocked! 🚀`
                  : `You scored ${progress[selectedSubject]?.[selectedTopic]?.score || 0}%. Review the material and try again. 💪`
                }
              </p>
              
              <div style={{ display: 'grid', gap: 12 }}>
                {!passed && (
                  <>
                    <button
                      onClick={() => setTopicStep("learn")}
                      className="btn-primary"
                      style={{
                        background: `linear-gradient(135deg,${subject.color},${subject.color}bb)`,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 50,
                        padding: '14px 24px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Icon.Book /> Review Material
                    </button>
                    <button
                      onClick={() => { 
                        setTestAnswers({});
                        setTestSubmitted(false);
                      }}
                      className="btn-primary"
                      style={{
                        background: "linear-gradient(135deg,#1a1a2e,#374151)",
                        color: '#fff',
                        border: 'none',
                        borderRadius: 50,
                        padding: '14px 24px',
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Icon.Retry /> Retake Test
                    </button>
                  </>
                )}
                
                {passed && nextTopic && (
                  <button
                    onClick={() => {
                      setSelectedTopic(nextTopic.id);
                      setTopicStep("learn");
                      setPracticeAnswers({});
                      setTestAnswers({});
                      setShowFeedback({});
                      setTestSubmitted(false);
                      setShowConfetti(false);
                    }}
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg,#059669,#10B981)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 50,
                      padding: '14px 24px',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    🚀 Next Topic: {nextTopic.title} →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── MOCK EXAM SCREEN ─────────────────────────────────────────────────────
  if (screen === "mock") {
    return <MockExam onBack={() => setScreen("home")} user={user} />;
  }

  return null;
}

// ─── MOCK EXAM COMPONENT ─────────────────────────────────────────────────────
function MockExam({ onBack, user }) {
  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    const generateMockExam = () => {
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
      
      // Shuffle and select 60-100 questions
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, 60 + Math.floor(Math.random() * 41)); // 60-100 questions
      
      setMockQuestions(selectedQuestions);
    };

    generateMockExam();
  }, []);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [examStarted, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitMock = async () => {
    if (Object.keys(mockAnswers).length < mockQuestions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    let correct = 0;
    mockQuestions.forEach(q => {
      if (mockAnswers[q.id] === q.answer) correct++;
    });

    const score = Math.round((correct / mockQuestions.length) * 100);
    const passed = score >= 70;

    try {
      // Save mock exam result
      await saveTestResult(user.id, 'Mock Exam', 'Full Syllabus', score, passed);
      
      setMockSubmitted(true);
    } catch (error) {
      console.error('Error saving mock exam result:', error);
    }
  };

  const startExam = () => {
    setExamStarted(true);
  };

  if (mockSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'DM Sans', sans-serif" }}>
        <FontLoader/>
        <div style={{ 
          background: "linear-gradient(135deg,#1a1a2e,#0f172a)",
          color: '#fff',
          padding: '40px 20px'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ 
              fontFamily: "'Sora', sans-serif", 
              fontSize: 32, 
              fontWeight: 800, 
              marginBottom: 16
            }}>
              🎯 Mock Exam Complete!
            </h2>
            <div style={{ fontSize: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{score}%</div>
              <p style={{ 
                fontSize: 18, 
                color: 'rgba(255,255,255,0.85)'
              }}>
                {passed 
                  ? "Congratulations! You've passed the mock exam with excellent performance."
                  : "Keep practicing! You're making good progress. Review the material and try again."
                }
              </p>
            </div>
            
            <button
              onClick={onBack}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg,#059669,#10B981)',
                color: '#fff',
                border: 'none',
                borderRadius: 50,
                padding: '16px 32px',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
                <Icon.Trophy /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FF', fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader/>
        <div style={{ 
          background: "linear-gradient(135deg,#1a1a2e,#0f172a)",
          color: '#fff',
          padding: '40px 20px'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ 
              fontFamily: "'Sora', sans-serif", 
              fontSize: 32, 
              fontWeight: 800, 
              marginBottom: 16
            }}>
              🎯 Mock Exam
            </h2>
            <p style={{ 
              fontSize: 18, 
              color: 'rgba(255,255,255,0.85)', 
              marginBottom: 32
            }}>
              60-100 mixed questions covering all Level 4 topics from Mathematics, Physics, Chemistry, and English.
              <br />
              2-hour time limit. Pass mark: 70%.
            </p>
            
            {!examStarted ? (
              <button
                onClick={startExam}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 50,
                  padding: '20px 40px',
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Start Exam
              </button>
            ) : (
              <div style={{ marginBottom: 32 }}>
                <div style={{ 
                  fontSize: 48, 
                  fontWeight: 700, 
                  color: '#059669', 
                  marginBottom: 16
                }}>
                  {formatTime(timeLeft)}
                </div>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>
                  Time remaining
                </p>
                
                {mockQuestions.map((q, index) => (
                  <div key={q.id} className="fade-in" style={{ 
                    background: '#fff', 
                    borderRadius: 12, 
                    padding: '20px', 
                    marginBottom: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: '#64748b', 
                      marginBottom: 8
                    }}>
                      Question {index + 1}
                    </div>
                    <p style={{ 
                      fontSize: 16, 
                      marginBottom: 16, 
                      lineHeight: 1.5
                    }}>
                      {q.q}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      {q.options.map((opt, oi) => (
                        <button
                          key={oi}
                          onClick={() => setMockAnswers(p => ({ ...p, [q.id]: oi }))}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: `2px solid ${mockAnswers[q.id] === oi ? '#10b981' : '#e2e8f0'}`,
                            background: mockAnswers[q.id] === oi ? '#D1FAE5' : '#fff',
                            cursor: 'pointer',
                            fontSize: 14
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: 8 }}>
                            {["A", "B", "C", "D"][oi]}.
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={handleSubmitMock}
                  disabled={Object.keys(mockAnswers).length < mockQuestions.length}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    background: Object.keys(mockAnswers).length >= mockQuestions.length 
                      ? 'linear-gradient(135deg,#059669,#10B981)' 
                      : '#e2e8f0',
                    color: Object.keys(mockAnswers).length >= mockQuestions.length ? '#fff' : '#94a3b8',
                    border: 'none',
                    borderRadius: 50,
                    padding: '16px',
                    fontSize: 18,
                    fontWeight: 600,
                    cursor: Object.keys(mockAnswers).length >= mockQuestions.length ? 'pointer' : 'not-allowed',
                    marginTop: 32
                  }}
                >
                  Submit Exam
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// ─── CONFETTI COMPONENT ─────────────────────────────────────────────────────
function Confetti() {
  useEffect(() => {
    const colors = ['#f44336', '#eab308', '#f59e0b', '#10b981', '#3b82f6'];
    const confettiCount = 50;
    
    const confetti = Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      emoji: ['🎉', '🎊', '🌟', '✨', '🎈'][Math.floor(Math.random() * 5)]
    }));
    
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    container.innerHTML = '';
    confetti.forEach(particle => {
      const element = document.createElement('div');
      element.style.cssText = `
        position: fixed;
        left: ${particle.left}%;
        top: ${particle.top}px;
        width: 10px;
        height: 10px;
        background: ${particle.color};
        border-radius: 50%;
        transform: rotate(${particle.rotation}deg) scale(${particle.scale});
        font-size: ${particle.scale * 20}px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        pointer-events: none;
        animation: fall 3s ease-in forwards;
      `;
      element.textContent = particle.emoji;
      container.appendChild(element);
    });
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const container = document.getElementById('confetti-container');
      if (container) {
        container.innerHTML = '';
      }
      document.head.removeChild(style);
    };
  }, []);

  return <div id="confetti-container" />;
}
