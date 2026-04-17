// JAMB Curriculum Data for Vanilla JavaScript
console.log('Loading curriculum data...');

// Complete JAMB Curriculum Structure with 4 Levels per Subject
const CURRICULUM = {
  mathematics: {
    id: "mathematics",
    name: "Mathematics",
    icon: "SUM",
    emoji: "📐",
    color: "#2563EB",
    light: "#EFF6FF",
    border: "#BFDBFE",
    levels: {
      1: {
        id: 1,
        name: "Foundation Mathematics",
        topics: [
          {
            id: "numbers-and-numeration",
            title: "Numbers and Numeration",
            learn: {
              content: "Understanding number systems, place value, and basic operations.",
              video: "https://www.youtube.com/watch?v=example1"
            },
            practice: [
              {
                question: "What is the place value of 7 in 4,732?",
                options: ["Units", "Tens", "Hundreds", "Thousands"],
                answer: 2,
                explanation: "In 4,732, the 7 is in the hundreds place."
              },
              {
                question: "Convert 1010 binary to decimal:",
                options: ["8", "10", "12", "14"],
                answer: 1,
                explanation: "1010 binary = 8 + 0 + 2 + 0 = 10 in decimal."
              }
            ],
            test: [
              {
                q: "What is the sum of 2,347 and 1,856?",
                options: ["4,103", "4,203", "4,303", "4,403"],
                answer: 1
              },
              {
                q: "Which of the following is a prime number?",
                options: ["15", "21", "27", "29"],
                answer: 3
              }
            ]
          },
          {
            id: "basic-algebra",
            title: "Basic Algebra",
            learn: {
              content: "Introduction to variables, equations, and simple algebraic expressions.",
              video: "https://www.youtube.com/watch?v=example2"
            },
            practice: [
              {
                question: "Solve for x: 2x + 5 = 15",
                options: ["x = 5", "x = 10", "x = 15", "x = 20"],
                answer: 0,
                explanation: "2x + 5 = 15, so 2x = 10, x = 5."
              }
            ],
            test: [
              {
                q: "If 3x - 7 = 14, what is x?",
                options: ["5", "6", "7", "8"],
                answer: 2
              }
            ]
          }
        ]
      },
      2: {
        id: 2,
        name: "Intermediate Mathematics",
        topics: [
          {
            id: "geometry-basics",
            title: "Geometry Basics",
            learn: {
              content: "Understanding shapes, angles, and basic geometric principles.",
              video: "https://www.youtube.com/watch?v=example3"
            },
            practice: [
              {
                question: "What is the sum of angles in a triangle?",
                options: ["90°", "180°", "270°", "360°"],
                answer: 1,
                explanation: "The sum of angles in any triangle is always 180°."
              }
            ],
            test: [
              {
                q: "A square has a side length of 6cm. What is its area?",
                options: ["12cm²", "24cm²", "36cm²", "48cm²"],
                answer: 2
              }
            ]
          }
        ]
      },
      3: {
        id: 3,
        name: "Advanced Mathematics",
        topics: [
          {
            id: "trigonometry",
            title: "Trigonometry",
            learn: {
              content: "Introduction to trigonometric functions and their applications.",
              video: "https://www.youtube.com/watch?v=example4"
            },
            practice: [
              {
                question: "What is sin(30°)?",
                options: ["0", "0.5", "0.866", "1"],
                answer: 1,
                explanation: "sin(30°) = 0.5"
              }
            ],
            test: [
              {
                q: "In a right triangle, if opposite = 3 and adjacent = 4, what is tan(angle)?",
                options: ["0.75", "1.33", "0.8", "1.25"],
                answer: 0
              }
            ]
          }
        ]
      },
      4: {
        id: 4,
        name: "Expert Mathematics",
        topics: [
          {
            id: "calculus-basics",
            title: "Calculus Basics",
            learn: {
              content: "Introduction to differentiation and integration.",
              video: "https://www.youtube.com/watch?v=example5"
            },
            practice: [
              {
                question: "What is the derivative of x²?",
                options: ["x", "2x", "x²", "2"],
                answer: 1,
                explanation: "The derivative of x² is 2x."
              }
            ],
            test: [
              {
                q: "What is the integral of 2x dx?",
                options: ["x² + C", "x + C", "2x² + C", "x²/2 + C"],
                answer: 0
              }
            ]
          }
        ]
      }
    }
  },
  english: {
    id: "english",
    name: "English Language",
    icon: "ABC",
    emoji: "📝",
    color: "#059669",
    light: "#ECFDF5",
    border: "#BBF7D0",
    levels: {
      1: {
        id: 1,
        name: "Foundation English",
        topics: [
          {
            id: "grammar-basics",
            title: "Grammar Basics",
            learn: {
              content: "Parts of speech, sentence structure, and basic grammar rules.",
              video: "https://www.youtube.com/watch?v=example6"
            },
            practice: [
              {
                question: "Which word is a noun in the sentence: 'The cat sleeps peacefully'?",
                options: ["The", "cat", "sleeps", "peacefully"],
                answer: 1,
                explanation: "Cat is a noun as it names an animal."
              }
            ],
            test: [
              {
                q: "Choose the correct verb: 'She ___ to school every day.'",
                options: ["go", "goes", "going", "went"],
                answer: 1
              }
            ]
          }
        ]
      },
      2: {
        id: 2,
        name: "Intermediate English",
        topics: [
          {
            id: "comprehension",
            title: "Reading Comprehension",
            learn: {
              content: "Understanding and analyzing written texts.",
              video: "https://www.youtube.com/watch?v=example7"
            },
            practice: [
              {
                question: "What is the main idea of a passage?",
                options: ["A supporting detail", "The central theme", "A minor point", "The conclusion"],
                answer: 1,
                explanation: "The main idea is the central theme of the passage."
              }
            ],
            test: [
              {
                q: "In literature, what does 'protagonist' mean?",
                options: ["Antagonist", "Main character", "Supporting character", "Narrator"],
                answer: 1
              }
            ]
          }
        ]
      },
      3: {
        id: 3,
        name: "Advanced English",
        topics: [
          {
            id: "essay-writing",
            title: "Essay Writing",
            learn: {
              content: "Structuring and writing effective essays.",
              video: "https://www.youtube.com/watch?v=example8"
            },
            practice: [
              {
                question: "What should be included in an essay introduction?",
                options: ["Only the thesis", "Hook, background, and thesis", "Just examples", "Only background"],
                answer: 1,
                explanation: "A good introduction has a hook, background information, and a thesis statement."
              }
            ],
            test: [
              {
                q: "How many paragraphs are typically in a standard essay?",
                options: ["3", "4", "5", "6"],
                answer: 2
              }
            ]
          }
        ]
      },
      4: {
        id: 4,
        name: "Expert English",
        topics: [
          {
            id: "literary-analysis",
            title: "Literary Analysis",
            learn: {
              content: "Advanced analysis of literary texts and themes.",
              video: "https://www.youtube.com/watch?v=example9"
            },
            practice: [
              {
                question: "What is 'symbolism' in literature?",
                options: ["Using symbols to represent ideas", "Writing about symbols", "Describing symbols", "Creating symbols"],
                answer: 0,
                explanation: "Symbolism is the use of symbols to represent ideas or qualities."
              }
            ],
            test: [
              {
                q: "In 'Animal Farm', what does the farm represent?",
                options: ["A real farm", "Soviet Union", "United States", "United Kingdom"],
                answer: 1
              }
            ]
          }
        ]
      }
    }
  },
  physics: {
    id: "physics",
    name: "Physics",
    icon: "ATOM",
    emoji: "⚡",
    color: "#DC2626",
    light: "#FEF2F2",
    border: "#FECACA",
    levels: {
      1: {
        id: 1,
        name: "Foundation Physics",
        topics: [
          {
            id: "motion-basics",
            title: "Motion Basics",
            learn: {
              content: "Understanding displacement, velocity, and acceleration.",
              video: "https://www.youtube.com/watch?v=example10"
            },
            practice: [
              {
                question: "What is the SI unit of velocity?",
                options: ["m/s", "m/s²", "km/h", "m"],
                answer: 0,
                explanation: "Velocity is measured in meters per second (m/s)."
              }
            ],
            test: [
              {
                q: "If a car travels 100km in 2 hours, what is its average speed?",
                options: ["25 km/h", "50 km/h", "75 km/h", "100 km/h"],
                answer: 1
              }
            ]
          }
        ]
      },
      2: {
        id: 2,
        name: "Intermediate Physics",
        topics: [
          {
            id: "forces",
            title: "Forces and Newton's Laws",
            learn: {
              content: "Understanding forces, friction, and Newton's laws of motion.",
              video: "https://www.youtube.com/watch?v=example11"
            },
            practice: [
              {
                question: "What is Newton's First Law also known as?",
                options: ["Law of Inertia", "Law of Acceleration", "Law of Action-Reaction", "Law of Gravity"],
                answer: 0,
                explanation: "Newton's First Law is also known as the Law of Inertia."
              }
            ],
            test: [
              {
                q: "What force opposes motion between two surfaces in contact?",
                options: ["Gravity", "Friction", "Tension", "Normal force"],
                answer: 1
              }
            ]
          }
        ]
      },
      3: {
        id: 3,
        name: "Advanced Physics",
        topics: [
          {
            id: "energy",
            title: "Energy and Work",
            learn: {
              content: "Understanding different forms of energy and work done.",
              video: "https://www.youtube.com/watch?v=example12"
            },
            practice: [
              {
                question: "What is the SI unit of energy?",
                options: ["Watt", "Joule", "Newton", "Pascal"],
                answer: 1,
                explanation: "Energy is measured in Joules."
              }
            ],
            test: [
              {
                q: "What type of energy is stored in a stretched rubber band?",
                options: ["Kinetic", "Potential", "Thermal", "Chemical"],
                answer: 1
              }
            ]
          }
        ]
      },
      4: {
        id: 4,
        name: "Expert Physics",
        topics: [
          {
            id: "electricity",
            title: "Electricity and Circuits",
            learn: {
              content: "Understanding electric current, voltage, and circuits.",
              video: "https://www.youtube.com/watch?v=example13"
            },
            practice: [
              {
                question: "What is the unit of electric current?",
                options: ["Volt", "Ohm", "Ampere", "Watt"],
                answer: 2,
                explanation: "Electric current is measured in Amperes (A)."
              }
            ],
            test: [
              {
                q: "In a series circuit, if one bulb burns out, what happens to the other bulbs?",
                options: ["They become brighter", "They go out", "They stay the same", "They become dimmer"],
                answer: 1
              }
            ]
          }
        ]
      }
    }
  },
  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    icon: "FLASK",
    emoji: "🧪",
    color: "#7C3AED",
    light: "#F3E8FF",
    border: "#DDD6FE",
    levels: {
      1: {
        id: 1,
        name: "Foundation Chemistry",
        topics: [
          {
            id: "atomic-structure",
            title: "Atomic Structure",
            learn: {
              content: "Understanding atoms, elements, and the periodic table.",
              video: "https://www.youtube.com/watch?v=example14"
            },
            practice: [
              {
                question: "What is the atomic number of Carbon?",
                options: ["4", "6", "8", "12"],
                answer: 1,
                explanation: "Carbon has atomic number 6."
              }
            ],
            test: [
              {
                q: "Which particle has a positive charge?",
                options: ["Electron", "Neutron", "Proton", "Atom"],
                answer: 2
              }
            ]
          }
        ]
      },
      2: {
        id: 2,
        name: "Intermediate Chemistry",
        topics: [
          {
            id: "chemical-bonds",
            title: "Chemical Bonds",
            learn: {
              content: "Understanding ionic, covalent, and metallic bonds.",
              video: "https://www.youtube.com/watch?v=example15"
            },
            practice: [
              {
                question: "What type of bond forms between metal and non-metal?",
                options: ["Covalent", "Ionic", "Metallic", "Hydrogen"],
                answer: 1,
                explanation: "Ionic bonds form between metals and non-metals."
              }
            ],
            test: [
              {
                q: "In H2O, what type of bond exists between hydrogen and oxygen?",
                options: ["Ionic", "Covalent", "Metallic", "Van der Waals"],
                answer: 1
              }
            ]
          }
        ]
      },
      3: {
        id: 3,
        name: "Advanced Chemistry",
        topics: [
          {
            id: "chemical-reactions",
            title: "Chemical Reactions",
            learn: {
              content: "Understanding different types of chemical reactions.",
              video: "https://www.youtube.com/watch?v=example16"
            },
            practice: [
              {
                question: "What is the product of 2H2 + O2?",
                options: ["H2O", "H2O2", "2H2O", "H2 + O2"],
                answer: 2,
                explanation: "2H2 + O2 produces 2H2O."
              }
            ],
            test: [
              {
                q: "What type of reaction is: A + B -> AB?",
                options: ["Decomposition", "Synthesis", "Single replacement", "Double replacement"],
                answer: 1
              }
            ]
          }
        ]
      },
      4: {
        id: 4,
        name: "Expert Chemistry",
        topics: [
          {
            id: "organic-chemistry",
            title: "Organic Chemistry Basics",
            learn: {
              content: "Introduction to organic compounds and their properties.",
              video: "https://www.youtube.com/watch?v=example17"
            },
            practice: [
              {
                question: "What is the general formula for alkanes?",
                options: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnH2n+1"],
                answer: 1,
                explanation: "Alkanes have the general formula CnH2n+2."
              }
            ],
            test: [
              {
                q: "How many bonds can carbon form?",
                options: ["2", "3", "4", "5"],
                answer: 2
              }
            ]
          }
        ]
      }
    }
  }
};

// Helper functions
function getSubjectById(subjectId) {
  return CURRICULUM[subjectId] || null;
}

function getLevelById(subjectId, levelId) {
  const subject = getSubjectById(subjectId);
  return subject?.levels[levelId] || null;
}

function getTopicById(subjectId, levelId, topicId) {
  const level = getLevelById(subjectId, levelId);
  return level?.topics.find(topic => topic.id === topicId) || null;
}

function getSubjectProgress(subjectId, userProgress) {
  const subject = CURRICULUM[subjectId];
  if (!subject || !userProgress) return { completed: 0, total: 0, percentage: 0 };
  
  const subjectProgress = userProgress[subjectId] || {};
  const totalTopics = Object.values(subject.levels).reduce((sum, level) => sum + level.topics.length, 0);
  const completedTopics = Object.values(subjectProgress).filter(topic => topic.completed).length;
  
  return {
    completed: completedTopics,
    total: totalTopics,
    percentage: Math.round((completedTopics / totalTopics) * 100)
  };
}

function getNextTopic(subjectId, levelId, topicId, userProgress) {
  const subject = CURRICULUM[subjectId];
  const level = subject.levels[levelId];
  const topicIndex = level.topics.findIndex(topic => topic.id === topicId);
  
  // Check next topic in same level
  if (topicIndex < level.topics.length - 1) {
    const nextTopic = level.topics[topicIndex + 1];
    if (isTopicUnlocked(subjectId, levelId, nextTopic.id, userProgress)) {
      return nextTopic;
    }
  }
  
  // Check first topic in next level
  const nextLevelId = levelId + 1;
  if (subject.levels[nextLevelId]) {
    const nextLevel = subject.levels[nextLevelId];
    const firstTopic = nextLevel.topics[0];
    if (isTopicUnlocked(subjectId, nextLevelId, firstTopic.id, userProgress)) {
      return firstTopic;
    }
  }
  
  return null;
}

function isTopicUnlocked(subjectId, levelId, topicId, userProgress) {
  // Level 1 topics are always unlocked
  if (levelId === 1) return true;
  
  // Check if previous topic in the same level is completed
  const subject = CURRICULUM[subjectId];
  const level = subject?.levels?.[levelId];
  if (!level) return false;
  
  const topicIndex = level.topics.findIndex(topic => topic.id === topicId);
  if (topicIndex === 0) return true; // First topic in level is always unlocked
  
  const previousTopic = level.topics[topicIndex - 1];
  const previousTopicProgress = userProgress?.[subjectId]?.[previousTopic.id];
  
  return previousTopicProgress?.completed || false;
}

function canAccessMockExam(userProgress) {
  // Check if all Level 4 topics are completed
  const subjects = Object.keys(CURRICULUM);
  
  for (const subjectId of subjects) {
    const subject = CURRICULUM[subjectId];
    const level4 = subject?.levels?.[4];
    if (!level4) return false;
    
    for (const topic of level4.topics) {
      const topicProgress = userProgress?.[subjectId]?.[topic.id];
      if (!topicProgress?.completed) return false;
    }
  }
  
  return true;
}

// Export for use in other files
window.Curriculum = {
  CURRICULUM,
  getSubjectById,
  getLevelById,
  getTopicById,
  getSubjectProgress,
  getNextTopic,
  isTopicUnlocked,
  canAccessMockExam
};

console.log('Curriculum loaded and exported successfully');
