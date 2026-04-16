// Complete JAMB Curriculum Structure with 4 Levels per Subject

export const CURRICULUM = {
  mathematics: {
    id: "mathematics",
    name: "Mathematics", 
    icon: "∑", 
    emoji: "📐",
    color: "#2563EB", 
    light: "#EFF6FF", 
    border: "#BFDBFE",
    levels: {
      1: {
        name: "Foundation",
        description: "Basic mathematical concepts and operations",
        topics: [
          {
            id: "numbers",
            title: "Numbers and Counting",
            description: "Understanding whole numbers, counting, and basic operations",
            learn: {
              overview: "Numbers are the foundation of mathematics. This level covers counting, place value, and basic arithmetic operations.",
              keyPoints: [
                "Counting numbers up to millions",
                "Place value and face value",
                "Basic addition and subtraction",
                "Multiplication as repeated addition",
                "Division as equal sharing"
              ],
              examples: [
                { q: "What is 345 + 127?", a: "345 + 127 = 472" },
                { q: "Divide 48 by 6", a: "48 ÷ 6 = 8" }
              ]
            },
            practice: [
              { q: "What is 234 + 156?", options: ["390", "400", "410", "420"], answer: 0 },
              { q: "Subtract 89 from 234", options: ["145", "155", "165", "175"], answer: 0 },
              { q: "Multiply 12 by 8", options: ["96", "86", "106", "116"], answer: 0 },
              { q: "Divide 144 by 12", options: ["10", "11", "12", "13"], answer: 2 }
            ],
            test: [
              { q: "What is the sum of 456 and 789?", options: ["1245", "1345", "1445", "1545"], answer: 0 },
              { q: "Subtract 234 from 567", options: ["333", "323", "343", "353"], answer: 0 },
              { q: "Multiply 34 by 25", options: ["850", "900", "950", "1000"], answer: 0 },
              { q: "Divide 840 by 14", options: ["50", "60", "70", "80"], answer: 0 },
              { q: "What is 15% of 200?", options: ["25", "30", "35", "40"], answer: 0 }
            ]
          },
          {
            id: "fractions",
            title: "Fractions and Decimals",
            description: "Understanding parts of whole numbers and decimal numbers",
            learn: {
              overview: "Fractions represent parts of whole numbers. Decimals are another way to represent parts.",
              keyPoints: [
                "Proper and improper fractions",
                "Mixed numbers",
                "Adding and subtracting fractions",
                "Decimal place value",
                "Converting fractions to decimals"
              ],
              examples: [
                { q: "Add 1/2 + 1/4", a: "1/2 + 1/4 = 3/4" },
                { q: "Convert 3/4 to decimal", a: "3/4 = 0.75" }
              ]
            },
            practice: [
              { q: "Add 1/3 + 2/3", options: ["1", "2/3", "3/3", "4/3"], answer: 0 },
              { q: "Subtract 1/2 from 3/4", options: ["1/4", "1/2", "3/4", "5/4"], answer: 0 },
              { q: "Convert 0.25 to fraction", options: ["1/4", "1/3", "1/5", "1/6"], answer: 0 }
            ],
            test: [
              { q: "Add 2 1/2 + 1 3/4", options: ["4 1/4", "4 1/2", "4 3/4", "5 1/4"], answer: 0 },
              { q: "What is 0.6 as a fraction?", options: ["3/5", "2/3", "3/4", "4/5"], answer: 0 },
              { q: "Multiply 1/2 × 3/4", options: ["3/8", "1/4", "3/4", "5/8"], answer: 0 }
            ]
          }
        ]
      },
      2: {
        name: "Preparatory",
        description: "Building foundation for advanced mathematics",
        topics: [
          {
            id: "algebra",
            title: "Basic Algebra",
            description: "Introduction to variables and equations",
            learn: {
              overview: "Algebra uses letters to represent unknown quantities and solve for them.",
              keyPoints: [
                "Variables and expressions",
                "Simple equations (x + a = b)",
                "BODMAS order of operations",
                "Like terms and simplification"
              ],
              examples: [
                { q: "Solve: x + 5 = 12", a: "x = 7" },
                { q: "Simplify: 2x + 3x", a: "2x + 3x = 5x" }
              ]
            },
            practice: [
              { q: "Solve: x + 8 = 15", options: ["x = 5", "x = 6", "x = 7", "x = 8"], answer: 0 },
              { q: "Simplify: 3a + 2a", options: ["5a", "6a", "a", "2a"], answer: 0 }
            ],
            test: [
              { q: "If 2x + 3 = 11, what is x?", options: ["3", "4", "5", "6"], answer: 1 },
              { q: "Simplify: 4x - 2x + x", options: ["3x", "2x", "5x", "x"], answer: 0 }
            ]
          }
        ]
      },
      3: {
        name: "Core",
        description: "Advanced mathematical concepts and problem-solving",
        topics: [
          {
            id: "advanced-algebra",
            title: "Advanced Algebra",
            description: "Complex equations and mathematical relationships",
            learn: {
              overview: "Advanced algebra covers quadratic equations, functions, and complex problem-solving.",
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
            },
            practice: [
              { q: "Solve: x² - 4x - 5 = 0", options: ["x = 5", "x = -1", "x = 1", "x = 2"], answer: 1 },
              { q: "Factor: x² - 16", options: ["(x-4)(x+4)", "(x-8)(x+2)", "(x-2)(x+8)", "(x-1)(x+16)"], answer: 0 }
            ],
            test: [
              { q: "Solve: 2x² - 8x + 6 = 0", options: ["x = 1", "x = 2", "x = 3", "x = 4"], answer: 0 },
              { q: "If (x-2)(x+3) = 0, find x", options: ["x = 2 or -3", "x = 2 or 3", "x = -2 or 3", "x = -2 or -3"], answer: 0 }
            ]
          }
        ]
      },
      4: {
        name: "JAMB Mastery",
        description: "Exam-level preparation and advanced topics",
        topics: [
          {
            id: "functions",
            title: "Functions and Calculus Basics",
            description: "Introduction to functions and basic calculus concepts",
            learn: {
              overview: "Functions are relationships between variables. Calculus studies change and rates.",
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
            },
            practice: [
              { q: "If f(x) = 3x - 2, find f(4)", options: ["10", "11", "12", "14"], answer: 0 },
              { q: "Domain of √(x-3)", options: ["x ≥ 3", "x > 3", "x ≤ 3", "all real numbers"], answer: 0 }
            ],
            test: [
              { q: "If f(x) = x² + 2x, find f(3)", options: ["15", "12", "18", "21"], answer: 0 },
              { q: "Domain of 1/(x²-4)", options: ["x ≠ ±2", "x ≠ 2", "x ≠ -2", "x ≠ 4"], answer: 0 }
            ]
          }
        ]
      }
    }
  },

  physics: {
    id: "physics",
    name: "Physics",
    icon: "⚛", 
    emoji: "⚡",
    color: "#059669", 
    light: "#ECFDF5", 
    border: "#A7F3D0",
    levels: {
      1: {
        name: "Foundation",
        description: "Introduction to physical concepts and measurements",
        topics: [
          {
            id: "basics",
            title: "What is Physics?",
            description: "Understanding the nature and scope of physics",
            learn: {
              overview: "Physics is the study of matter, energy, and their interactions in space and time.",
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
            },
            practice: [
              { q: "Convert 3.2 km to meters", options: ["3200 m", "320 m", "32,000 m", "320,000 m"], answer: 0 },
              { q: "Write 45000 in scientific notation", options: ["4.5×10⁴", "4.5×10³", "45×10³", "4.5×10⁵"], answer: 0 }
            ],
            test: [
              { q: "Convert 0.0025 km to meters", options: ["2.5 m", "25 m", "250 m", "2500 m"], answer: 0 },
              { q: "Express 670,000 in scientific notation", options: ["6.7×10⁵", "6.7×10⁴", "67×10⁴", "6.7×10⁶"], answer: 0 }
            ]
          }
        ]
      },
      2: {
        name: "Preparatory",
        description: "Fundamental physical laws and motion",
        topics: [
          {
            id: "motion",
            title: "Motion and Forces",
            description: "Understanding how objects move and why",
            learn: {
              overview: "Motion describes how objects change position over time. Forces cause motion.",
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
            },
            practice: [
              { q: "Distance traveled at 20 m/s for 30 s", options: ["600 m", "900 m", "300 m", "150 m"], answer: 0 },
              { q: "Force needed for 5 kg mass, 2 m/s²", options: ["5 N", "10 N", "15 N", "20 N"], answer: 1 }
            ],
            test: [
              { q: "Object falls 45 m in 3 s", options: ["g = 10 m/s²", "g = 15 m/s²", "g = 20 m/s²", "g = 30 m/s²"], answer: 0 },
              { q: "10 kg mass requires 50 N force", options: ["a = 5 m/s²", "a = 10 m/s²", "a = 15 m/s²", "a = 20 m/s²"], answer: 0 }
            ]
          }
        ]
      },
      3: {
        name: "Core",
        description: "Energy, electricity, and waves",
        topics: [
          {
            id: "energy",
            title: "Energy and Work",
            description: "Understanding energy forms and work calculations",
            learn: {
              overview: "Energy is the capacity to do work. Work is force × distance.",
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
            },
            practice: [
              { q: "KE of 2 kg mass at 10 m/s", options: ["50 J", "100 J", "150 J", "200 J"], answer: 1 },
              { q: "Work done by 20 N force over 5 m", options: ["80 J", "100 J", "120 J", "150 J"], answer: 1 }
            ],
            test: [
              { q: "Power if 1000 J work in 10 s", options: ["100 W", "200 W", "500 W", "1000 W"], answer: 0 },
              { q: "Height for PE = 200 J (g = 10 m/s²)", options: ["10 m", "20 m", "30 m", "40 m"], answer: 1 }
            ]
          }
        ]
      },
      4: {
        name: "JAMB Mastery",
        description: "Advanced physics and exam preparation",
        topics: [
          {
            id: "electricity",
            title: "Electricity and Magnetism",
            description: "Advanced electrical concepts and applications",
            learn: {
              overview: "Electricity involves charge, current, and circuits. Magnetism relates to electric phenomena.",
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
            },
            practice: [
              { q: "Current through 10 Ω with 5 V", options: ["0.5 A", "1 A", "2 A", "5 A"], answer: 0 },
              { q: "Power of 2 A through 5 Ω", options: ["10 W", "20 W", "30 W", "40 W"], answer: 1 }
            ],
            test: [
              { q: "Resistance for 12 V, 3 A", options: ["2 Ω", "4 Ω", "6 Ω", "8 Ω"], answer: 1 },
              { q: "Power dissipated in 4 Ω with 2 A", options: ["8 W", "16 W", "32 W", "64 W"], answer: 1 }
            ]
          }
        ]
      }
    }
  },

  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    icon: "⚗", 
    emoji: "🧪",
    color: "#DC2626", 
    light: "#FEF3C7", 
    border: "#FCA5A5",
    levels: {
      1: {
        name: "Foundation",
        description: "Introduction to matter and basic chemical concepts",
        topics: [
          {
            id: "matter",
            title: "States of Matter",
            description: "Understanding solids, liquids, and gases",
            learn: {
              overview: "Matter exists in three main states with different properties.",
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
            },
            practice: [
              { q: "Which has fixed volume?", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: 0 },
              { q: "Which has most energy?", options: ["Gas", "Liquid", "Solid", "Plasma"], answer: 0 }
            ],
            test: [
              { q: "Process: gas → liquid", options: ["Condensation", "Evaporation", "Sublimation", "Deposition"], answer: 0 },
              { q: "Property: definite shape and volume", options: ["Solid", "Liquid", "Gas", "Plasma"], answer: 0 }
            ]
          }
        ]
      },
      2: {
        name: "Preparatory",
        description: "Atomic structure and chemical reactions",
        topics: [
          {
            id: "atomic",
            title: "Atomic Structure",
            description: "Understanding atoms, elements, and periodic table",
            learn: {
              overview: "Atoms are the building blocks of matter. Elements organize by atomic number.",
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
            },
            practice: [
              { q: "Oxygen has 8 protons, 8 neutrons", options: ["O-16", "O-15", "O-17", "O-18"], answer: 0 },
              { q: "Period 3 starts with", options: ["Sodium", "Magnesium", "Aluminum", "Silicon"], answer: 0 }
            ],
            test: [
              { q: "Element with 26 protons", options: ["Iron", "Cobalt", "Nickel", "Copper"], answer: 0 },
              { q: "Noble gas configuration", options: ["Full outer shell", "7 valence electrons", "No valence electrons", "1 valence electron"], answer: 0 }
            ]
          }
        ]
      },
      3: {
        name: "Core",
        description: "Chemical bonding and quantitative chemistry",
        topics: [
          {
            id: "bonding",
            title: "Chemical Bonding",
            description: "How atoms combine to form compounds",
            learn: {
              overview: "Atoms bond through electron sharing or transfer to form stable compounds.",
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
            },
            practice: [
              { q: "Na and F form", options: ["NaF (ionic)", "NaF₂ (covalent)", "Na₂F (ionic)", "NaF₃ (covalent)"], answer: 0 },
              { q: "C and O form", options: ["CO₂ (covalent)", "CO (ionic)", "C₂O (covalent)", "CO₂ (ionic)"], answer: 0 }
            ],
            test: [
              { q: "Bond type: metal + nonmetal", options: ["Always ionic", "Always covalent", "Can be either", "Never forms bonds"], answer: 2 },
              { q: "Polar molecule example", options: ["H₂O", "CO₂", "CH₄", "N₂"], answer: 1 }
            ]
          }
        ]
      },
      4: {
        name: "JAMB Mastery",
        description: "Advanced chemistry and exam preparation",
        topics: [
          {
            id: "equilibrium",
            title: "Chemical Equilibrium",
            description: "Balanced reactions and equilibrium concepts",
            learn: {
              overview: "Chemical equilibrium occurs when forward and reverse reaction rates are equal.",
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
            },
            practice: [
              { q: "Increase pressure shifts equilibrium", options: ["To products", "To reactants", "No shift", "Random shift"], answer: 0 },
              { q: "K > 1 means", options: ["Products favored", "Reactants favored", "Equal amounts", "No reaction"], answer: 0 }
            ],
            test: [
              { q: "Temperature increase and K", options: ["Increases for endothermic", "Decreases for exothermic", "No effect", "Always increases"], answer: 0 },
              { q: "Catalyst affects equilibrium", options: ["Speeds up both directions", "Only affects rate", "Changes K value", "Stops reaction"], answer: 1 }
            ]
          }
        ]
      }
    }
  },

  english: {
    id: "english",
    name: "English Language",
    icon: "📝", 
    emoji: "📚",
    color: "#7C3AED", 
    light: "#EDE9FE", 
    border: "#BBF7D0",
    levels: {
      1: {
        name: "Foundation",
        description: "Basic language skills and vocabulary",
        topics: [
          {
            id: "alphabet",
            title: "Alphabet and Phonics",
            description: "Understanding letters, sounds, and basic reading",
            learn: {
              overview: "The English alphabet has 26 letters representing different sounds in words.",
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
            },
            practice: [
              { q: "Which has long 'a' sound?", options: ["Cake", "Cat", "Apple", "Hat"], answer: 0 },
              { q: "Silent letter in 'knife'?", options: ["k", "n", "f", "e"], answer: 1 }
            ],
            test: [
              { q: "Long 'e' in 'these'?", options: ["th", "se", "ee", "sh"], answer: 1 },
              { q: "Silent letters in 'psychology'?", options: ["p", "s", "c", "h"], answer: 1 }
            ]
          }
        ]
      },
      2: {
        name: "Preparatory",
        description: "Grammar and sentence structure",
        topics: [
          {
            id: "grammar",
            title: "Basic Grammar",
            description: "Understanding sentence structure and parts of speech",
            learn: {
              overview: "Grammar provides rules for constructing correct sentences.",
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
            },
            practice: [
              { q: "Correct: 'He go to school'", options: ["He goes to school", "He going to school", "He go to school", "He is go to school"], answer: 0 },
              { q: "Plural of 'child'?", options: ["childs", "children", "childrens", "childes"], answer: 1 }
            ],
            test: [
              { q: "Choose correct: 'They ___ playing'", options: ["is", "are", "was", "were"], answer: 0 },
              { q: "Past tense of 'begin'?", options: ["began", "begun", "beginned", "begined"], answer: 0 }
            ]
          }
        ]
      },
      3: {
        name: "Core",
        description: "Comprehension and writing skills",
        topics: [
          {
            id: "comprehension",
            title: "Reading Comprehension",
            description: "Understanding and analyzing written passages",
            learn: {
              overview: "Comprehension involves understanding main ideas, details, and inferences.",
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
            },
            practice: [
              { q: "Passage about dogs, main idea?", options: ["Dogs are loyal", "Dogs need food", "Dogs can bark", "Dogs have fur"], answer: 0 },
              { q: "Author's purpose in instructions?", options: ["To inform", "To entertain", "To persuade", "To confuse"], answer: 0 }
            ],
            test: [
              { q: "What does 'metaphorically' mean?", options: ["Symbolically", "Literally", "Quickly", "Slowly"], answer: 0 },
              { q: "Best title for 'How to study'?", options: ["Study Methods", "My Life", "Random Thoughts", "School Rules"], answer: 0 }
            ]
          }
        ]
      },
      4: {
        name: "JAMB Mastery",
        description: "Advanced comprehension and exam preparation",
        topics: [
          {
            id: "summary",
            title: "Summary Writing",
            description: "Condensing information and advanced analysis",
            learn: {
              overview: "Summary writing captures key points concisely while maintaining accuracy.",
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
            },
            practice: [
              { q: "Best summary length for 500-word essay", options: ["50 words", "100 words", "150 words", "200 words"], answer: 0 },
              { q: "Include in summary?", options: ["All details", "Only main points", "Personal opinions", "Examples"], answer: 1 }
            ],
            test: [
              { q: "Plagiarism involves", options: ["Copying work", "Not citing sources", "Both A and B", "Original work only"], answer: 2 },
              { q: "Good summary characteristic", options: ["Long and detailed", "Short and vague", "Concise and accurate", "Complex language"], answer: 2 }
            ]
          }
        ]
      }
    }
  }
};

// Helper functions for curriculum management
export const getSubjectById = (subjectId) => {
  return CURRICULUM[subjectId] || null;
};

export const getLevelById = (subjectId, levelId) => {
  const subject = CURRICULUM[subjectId];
  return subject?.levels?.[levelId] || null;
};

export const getTopicById = (subjectId, levelId, topicId) => {
  const level = getLevelById(subjectId, levelId);
  return level?.topics?.find(topic => topic.id === topicId) || null;
};

export const getAllSubjects = () => {
  return Object.keys(CURRICULUM).map(key => ({
    id: key,
    ...CURRICULUM[key]
  }));
};

export const getSubjectProgress = (subjectId, userProgress) => {
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
};

export const getNextTopic = (subjectId, levelId, topicId, userProgress) => {
  const subject = CURRICULUM[subjectId];
  const level = subject?.levels?.[levelId];
  if (!level) return null;
  
  const topicIndex = level.topics.findIndex(topic => topic.id === topicId);
  const nextTopic = level.topics[topicIndex + 1];
  
  // Check if user has completed current topic
  const currentTopicProgress = userProgress?.[subjectId]?.[topicId];
  if (!currentTopicProgress?.completed) return null;
  
  return nextTopic || null;
};

export const isTopicUnlocked = (subjectId, levelId, topicId, userProgress) => {
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
};

export const getOverallProgress = (userProgress) => {
  const subjects = Object.keys(CURRICULUM);
  const totalSubjects = subjects.length;
  const completedSubjects = subjects.filter(subjectId => {
    const progress = getSubjectProgress(subjectId, userProgress);
    return progress.percentage === 100;
  }).length;
  
  return Math.round((completedSubjects / totalSubjects) * 100);
};

export const canAccessMockExam = (userProgress) => {
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
};
