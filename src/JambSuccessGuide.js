import { useEffect, useMemo, useState } from "react";

import "./App.css";



const APP_TITLE = "JAMB Learning";



const CURRICULUM = [

  {

    id: "mathematics",

    name: "Mathematics",

    color: "#1d4ed8",

    accent: "#dbeafe",

    levels: [

      {

        id: "foundation",

        label: "Level 1: Foundation",

        description:

          "Start with numbers, basic operations, fractions, decimals and simple word problems. This builds the true foundation for later JAMB success.",

        topics: [

          {

            id: "math-foundation",

            title: "Math Foundation",

            watch: "Math foundations: numbers, operations and fractions",

            learn: "Begin with the building blocks of math: whole numbers, addition, subtraction, multiplication and division. Learn how fractions, decimals and percentages are used in everyday questions, then solve simple word problems step by step.",

            practice: [

              { q: "5 + 7 = ?", options: ["10", "11", "12", "13"], answer: 2 },

              { q: "12 - 4 = ?", options: ["8", "6", "10", "7"], answer: 0 },

              { q: "3 × 4 = ?", options: ["7", "12", "14", "10"], answer: 1 },

              { q: "8 ÷ 2 = ?", options: ["2", "4", "6", "8"], answer: 1 },

              { q: "50% of 20 = ?", options: ["5", "10", "15", "20"], answer: 1 },

            ],

            test: [

              { q: "Which is a whole number?", options: ["3", "2.5", "-1.2", "1/2"], answer: 0 },

              { q: "7 + 6 = ?", options: ["11", "12", "13", "14"], answer: 2 },

              { q: "14 - 9 = ?", options: ["7", "5", "6", "4"], answer: 1 },

              { q: "6 × 5 = ?", options: ["25", "30", "35", "20"], answer: 1 },

              { q: "18 ÷ 3 = ?", options: ["5", "6", "7", "8"], answer: 1 },

              { q: "0.5 as a fraction is", options: ["1/2", "1/4", "2/5", "1/5"], answer: 0 },

              { q: "20% of 50 = ?", options: ["5", "8", "10", "12"], answer: 2 },

              { q: "If you add 15 and 25 you get", options: ["30", "35", "40", "45"], answer: 2 },

              { q: "A simple word problem: John has 4 apples, he buys 3 more. How many?", options: ["5", "6", "7", "8"], answer: 2 },

              { q: "What is 2.5 + 1.5?", options: ["4.0", "3.0", "3.5", "4.5"], answer: 0 },

            ],

          },

        ],

      },

      {

        id: "preparatory",

        label: "Level 2: Preparatory",

        description:

          "Build the junior secondary foundation with factors, ratios, basic algebra, simple equations and graph reading.",

        topics: [

          {

            id: "math-preparatory",

            title: "Math Preparatory",

            watch: "Factors, ratios, basic algebra and graphs for JAMB",

            learn: "Learn how to work with factors, multiples, ratios and proportions. Begin algebra with expressions like x + 2 = 5, solve simple linear equations and read basic graphs with confidence.",

            practice: [

              { q: "Which is a factor of 12?", options: ["7", "8", "4", "5"], answer: 2 },

              { q: "Ratio 2:4 simplifies to", options: ["1:2", "2:1", "1:4", "4:2"], answer: 0 },

              { q: "If x + 3 = 7, x = ?", options: ["2", "3", "4", "5"], answer: 2 },

              { q: "Solve 2x = 10, x = ?", options: ["2", "3", "4", "5"], answer: 3 },

              { q: "A graph that rises from left to right shows", options: ["negative trend", "positive trend", "constant value", "no change"], answer: 1 },

            ],

            test: [

              { q: "Which number is a multiple of 6?", options: ["14", "18", "20", "22"], answer: 1 },

              { q: "Ratio 3:9 equals", options: ["1:2", "1:3", "3:1", "2:3"], answer: 1 },

              { q: "If x - 2 = 6, x = ?", options: ["4", "6", "8", "10"], answer: 2 },

              { q: "Solve 4 + y = 9, y = ?", options: ["3", "4", "5", "6"], answer: 2 },

              { q: "The graph of y = 2x is", options: ["a straight line", "a curve", "a circle", "a parabola"], answer: 0 },

              { q: "A factor pair for 18 is", options: ["2 and 9", "3 and 7", "4 and 5", "5 and 6"], answer: 0 },

              { q: "If 3/6 = x/4, then x = ?", options: ["1", "2", "3", "4"], answer: 1 },

              { q: "What is 7 + x = 12? x = ?", options: ["3", "4", "5", "6"], answer: 2 },

              { q: "In a graph, the horizontal axis is called", options: ["y-axis", "x-axis", "z-axis", "t-axis"], answer: 1 },

              { q: "Which is the greatest common factor of 12 and 18?", options: ["2", "3", "6", "9"], answer: 2 },

            ],

          },

        ],

      },

      {

        id: "core",

        label: "Level 3: Core",

        description:

          "Move into senior secondary math: algebra, indices, linear and quadratic equations, basic trigonometry and statistics.",

        topics: [

          {

            id: "math-core",

            title: "Math Core",

            watch: "Algebra, indices, equations and basic trigonometry",

            learn: "Master algebraic expressions, indices and logarithms, solve linear and quadratic equations, and learn the first trigonometry principles. Use statistics basics to analyse data and answer exam-style questions.",

            practice: [

              { q: "Simplify 3x + 4x = ?", options: ["7x", "12x", "x", "1x"], answer: 0 },

              { q: "2^3 = ?", options: ["6", "8", "9", "4"], answer: 1 },

              { q: "Solve x + 5 = 12, x = ?", options: ["5", "6", "7", "8"], answer: 2 },

              { q: "sin 30° equals", options: ["0", "1/2", "1", "√2/2"], answer: 1 },

              { q: "Mean of 2, 4, 6 is", options: ["3", "4", "5", "6"], answer: 1 },

            ],

            test: [

              { q: "Factorise x^2 - 9", options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-4)(x+4)", "(x+3)^2"], answer: 0 },

              { q: "What is 4^2?", options: ["6", "8", "12", "16"], answer: 3 },

              { q: "Solve x - 7 = 2, x = ?", options: ["7", "8", "9", "10"], answer: 2 },

              { q: "A quadratic equation has the highest power", options: ["1", "2", "3", "4"], answer: 1 },

              { q: "cos 0° = ?", options: ["0", "1", "-1", "1/2"], answer: 1 },

              { q: "If numbers are 3, 4, 5, their mean is", options: ["3", "4", "5", "6"], answer: 1 },

              { q: "Simplify 5x - 2x = ?", options: ["2x", "3x", "7x", "x"], answer: 1 },

              { q: "What is log10(100)?", options: ["1", "2", "3", "4"], answer: 1 },

              { q: "2x = 10, x = ?", options: ["2", "4", "5", "6"], answer: 2 },

              { q: "Which shape is used for sine ratios?", options: ["Circle", "Triangle", "Square", "Line"], answer: 1 },

            ],

          },

        ],

      },

      {

        id: "jamb-mastery",

        label: "Level 4: JAMB Mastery",

        description:

          "Practice advanced algebra, functions, trigonometry, calculus basics and probability with JAMB-style questions for exam mastery.",

        topics: [

          {

            id: "math-mastery",

            title: "Math Mastery",

            watch: "Advanced math for JAMB: functions, trigonometry and probability",

            learn: "This level prepares you for real JAMB questions. Study functions, more challenging algebra, advanced trig concepts, an introduction to calculus, probability and full exam-style practice.",

            practice: [

              { q: "f(x) = 2x + 1. What is f(3)?", options: ["5", "6", "7", "8"], answer: 2 },

              { q: "The probability of rolling a 6 on a fair die is", options: ["1/3", "1/6", "1/2", "1/4"], answer: 1 },

              { q: "Derivative of x^2 is", options: ["2x", "x", "x^2", "2"], answer: 0 },

              { q: "tan 45° = ?", options: ["0", "1", "√2", "√3"], answer: 1 },

              { q: "If f(x) = x^2, f(2) = ?", options: ["2", "4", "6", "8"], answer: 1 },

            ],

            test: [

              { q: "What is f(1) if f(x) = 3x - 2?", options: ["1", "0", "2", "3"], answer: 0 },

              { q: "Probabilities range from", options: ["0 to 1", "0 to 10", "1 to 100", "-1 to 1"], answer: 0 },

              { q: "Which is a quadratic function?", options: ["y = 2x + 1", "y = x^2 + 3", "y = 3", "y = 1/x"], answer: 1 },

              { q: "sin 90° = ?", options: ["0", "1", "-1", "0.5"], answer: 1 },

              { q: "The derivative of x^3 is", options: ["3x^2", "x^2", "3x", "x^3"], answer: 0 },

              { q: "A function maps", options: ["two inputs to one output", "one input to one output", "no input", "many outputs to one input"], answer: 1 },

              { q: "cos 60° = ?", options: ["1", "0.5", "√2/2", "0"], answer: 1 },

              { q: "What is 40% of 80?", options: ["20", "24", "32", "40"], answer: 2 },

              { q: "If x^2 = 25, x = ?", options: ["5 only", "-5 only", "±5", "0"], answer: 2 },

              { q: "Which is a JAMB-style question skill?", options: ["Guessing without practice", "Understanding concepts and practicing steps", "Skipping foundations", "Memorizing only formulas"], answer: 1 },

            ],

          },

        ],

      },

    ],

  },

  {

    id: "physics",

    name: "Physics",

    color: "#047857",

    accent: "#d1fae5",

    levels: [

      {

        id: "foundation",

        label: "Level 1: Foundation",

        description:

          "Learn what physics studies, how units work, basic measurement skills and the difference between scalars and vectors.",

        topics: [

          {

            id: "physics-foundation",

            title: "Physics Foundation",

            watch: "Physics basics: measurement, units and motion ideas",

            learn: "Physics begins with clear ideas: what the subject studies, why units matter, how measurement works and the difference between scalars and vectors. This level helps you understand the language of physics before formulas.",

            practice: [

              { q: "Physics studies", options: ["living things", "motion, energy and matter", "languages", "history"], answer: 1 },

              { q: "A scalar quantity does NOT include", options: ["magnitude", "direction", "size", "amount"], answer: 1 },

              { q: "Which is a unit of length?", options: ["meter", "newton", "joule", "ampere"], answer: 0 },

              { q: "Time is measured in", options: ["meters", "seconds", "kilograms", "amps"], answer: 1 },

              { q: "Which is a vector?", options: ["Speed", "Mass", "Displacement", "Time"], answer: 2 },

            ],

            test: [

              { q: "Physics is the study of", options: ["numbers", "motion and energy", "poetry", "history"], answer: 1 },

              { q: "Mass is measured in", options: ["kg", "m", "s", "A"], answer: 0 },

              { q: "Speed is scalar and velocity is", options: ["scalar", "vector", "temperature", "mass"], answer: 1 },

              { q: "A kilogram measures", options: ["force", "mass", "distance", "time"], answer: 1 },

              { q: "A second measures", options: ["time", "distance", "speed", "energy"], answer: 0 },

              { q: "The symbol for meter is", options: ["m", "s", "kg", "A"], answer: 0 },

              { q: "A vector has", options: ["only magnitude", "magnitude and direction", "only direction", "no magnitude"], answer: 1 },

              { q: "Temperature measures", options: ["force", "energy", "heat intensity", "time"], answer: 2 },

              { q: "A scale for weight uses", options: ["newton", "meter", "second", "volt"], answer: 0 },

              { q: "Units are important because they", options: ["make equations wrong", "give meaning to measurements", "are optional", "replace numbers"], answer: 1 },

            ],

          },

        ],

      },

      {

        id: "preparatory",

        label: "Level 2: Preparatory",

        description:

          "Begin physics problem solving with motion basics, force, energy concepts and simple heat ideas.",

        topics: [

          {

            id: "physics-preparatory",

            title: "Physics Preparatory",

            watch: "Motion, force, energy and heat for beginner physics",

            learn: "Understand speed, distance and time. Learn the idea of force as push or pull, basic energy types and how heat moves. These concepts are the first physics tools you need.",

            practice: [

              { q: "Speed = distance ÷ ?", options: ["time", "force", "energy", "mass"], answer: 0 },

              { q: "A push or pull is called", options: ["energy", "force", "power", "momentum"], answer: 1 },

              { q: "Heat moves from hot to", options: ["cold", "warm", "cool", "same"], answer: 0 },

              { q: "If a car travels 50km in 2h, its speed is", options: ["25 km/h", "50 km/h", "100 km/h", "20 km/h"], answer: 0 },

              { q: "Kinetic energy is energy of", options: ["motion", "position", "heat", "sound"], answer: 0 },

            ],

            test: [

              { q: "Distance = speed × ?", options: ["time", "force", "energy", "mass"], answer: 0 },

              { q: "A stronger push increases", options: ["speed", "force", "velocity", "all of these"], answer: 3 },

              { q: "Heat is a form of", options: ["mass", "energy", "volume", "charge"], answer: 1 },

              { q: "The unit for force is", options: ["N", "m", "s", "J"], answer: 0 },

              { q: "A moving object has", options: ["potential energy", "kinetic energy", "no energy", "static energy"], answer: 1 },

              { q: "Speed is measured in", options: ["m/s", "kg", "A", "mol"], answer: 0 },

              { q: "If a force makes an object move, work is", options: ["done", "not done", "measured in seconds", "measured in amps"], answer: 0 },

              { q: "A car slowing down is due to", options: ["acceleration", "deceleration", "velocity", "distance"], answer: 1 },

              { q: "Heat transfer by contact is", options: ["conduction", "convection", "radiation", "sound"], answer: 0 },

              { q: "Energy cannot be", options: ["created or destroyed", "measured", "transferred", "seen"], answer: 0 },

            ],

          },

        ],

      },

      {

        id: "core",

        label: "Level 3: Core",

        description:

          "Study Newton's laws, work and energy, electricity, waves and light using senior secondary physics examples.",

        topics: [

          {

            id: "physics-core",

            title: "Physics Core",

            watch: "Laws of motion, work, electricity and waves for JAMB",

            learn: "Master the laws of motion, how work and energy relate, the basics of electricity, and the behaviour of waves and light. These ideas appear often in JAMB questions.",

            practice: [

              { q: "Newton's first law describes", options: ["energy", "inertia", "force", "momentum"], answer: 1 },

              { q: "Work = force × ?", options: ["distance", "time", "speed", "acceleration"], answer: 0 },

              { q: "Current is measured in", options: ["V", "A", "Ω", "J"], answer: 1 },

              { q: "Light travels in", options: ["curves", "straight lines", "circles", "zigzags"], answer: 1 },

              { q: "A sound wave is a", options: ["transverse", "longitudinal", "static", "electric"], answer: 1 },

            ],

            test: [

              { q: "Newton's second law is F =", options: ["ma", "mv", "mg", "m/a"], answer: 0 },

              { q: "Which is a conductor?", options: ["wood", "plastic", "copper", "rubber"], answer: 2 },

              { q: "Work has units of", options: ["N", "J", "W", "kg"], answer: 1 },

              { q: "Light bending is called", options: ["reflection", "refraction", "diffraction", "absorption"], answer: 1 },

              { q: "A wave with vibration along travel direction is", options: ["transverse", "longitudinal", "circular", "stationary"], answer: 1 },

              { q: "Force is measured in", options: ["J", "N", "A", "m"], answer: 1 },

              { q: "Which law explains balanced forces?", options: ["1st law", "2nd law", "3rd law", "4th law"], answer: 0 },

              { q: "Electric power is P =", options: ["VI", "V/I", "I/V", "V+I"], answer: 0 },

              { q: "Reflection happens when light hits a", options: ["mirror", "black hole", "vacuum", "pipe"], answer: 0 },

              { q: "A magnetic field is produced by", options: ["static charge", "moving charge", "insulator", "cold temperature"], answer: 1 },

            ],

          },

        ],

      },

      {

        id: "jamb-mastery",

        label: "Level 4: JAMB Mastery",

        description:

          "Tackle circuits, electromagnetism, modern physics and full problem solving with exam-style questions.",

        topics: [

          {

            id: "physics-mastery",

            title: "Physics Mastery",

            watch: "Circuits, electromagnetism and JAMB-style physics problem solving",

            learn: "Practice circuit diagrams, understand electromagnetism basics, explore modern physics ideas and solve full exam-style problems. This level prepares you for the harder JAMB questions.",

            practice: [

              { q: "Ohm's law is V =", options: ["IR", "I/R", "R/I", "I+R"], answer: 0 },

              { q: "Current in a series circuit is", options: ["same everywhere", "different in each resistor", "zero", "increasing"], answer: 0 },

              { q: "Magnetic field lines around a wire are", options: ["straight", "circular", "zigzag", "horizontal"], answer: 1 },

              { q: "A nucleus is in", options: ["atom center", "electron shell", "outside atom", "vacuum"], answer: 0 },

              { q: "Radio waves are a type of", options: ["mechanical wave", "electromagnetic wave", "sound wave", "matter wave"], answer: 1 },

            ],

            test: [

              { q: "If R = 5Ω and I = 2A, V = ?", options: ["2.5V", "7V", "10V", "0V"], answer: 2 },

              { q: "In a series circuit, total R is", options: ["R1+R2", "R1×R2", "R1/R2", "1/R1+1/R2"], answer: 0 },

              { q: "Electromagnetism links electricity and", options: ["light", "magnetism", "sound", "heat"], answer: 1 },

              { q: "An electron carries", options: ["positive charge", "negative charge", "no charge", "mass only"], answer: 1 },

              { q: "The nucleus contains", options: ["electrons", "protons and neutrons", "photons", "neutrons only"], answer: 1 },

              { q: "A device that makes DC from AC is a", options: ["transformer", "rectifier", "motor", "generator"], answer: 1 },

              { q: "Faraday's experiment showed electricity from", options: ["light", "magnet motion", "heat", "sound"], answer: 1 },

              { q: "Which is a modern physics topic?", options: ["gravity", "electrostatics", "atomic structure", "simple mechanics"], answer: 2 },

              { q: "A charged particle moves in a magnetic field and experiences", options: ["magnetic force", "no force", "heat", "light"], answer: 0 },

              { q: "JAMB physics problems require", options: ["memorizing only formulas", "concept understanding and practice", "guessing", "ignoring units"], answer: 1 },

            ],

          },

        ],

      },

    ],

  },

  {

    id: "chemistry",

    name: "Chemistry",

    color: "#be123c",

    accent: "#fee2e2",

    levels: [

      {

        id: "foundation",

        label: "Level 1: Foundation",

        description:

          "Begin chemistry with the definition of matter, the states of matter, elements versus compounds, and simple mixtures.",

        topics: [

          {

            id: "chemistry-foundation",

            title: "Chemistry Foundation",

            watch: "Chemistry basics: matter, elements and mixtures",

            learn: "Chemistry starts by understanding matter. Learn the difference between solids, liquids and gases, how elements differ from compounds, and how simple mixtures are formed and separated.",

            practice: [

              { q: "Matter is anything that has", options: ["color", "mass and volume", "temperature", "sound"], answer: 1 },

              { q: "A solid has", options: ["fixed shape", "no shape", "always gas", "no volume"], answer: 0 },

              { q: "Water is a", options: ["compound", "element", "mixture", "solution"], answer: 0 },

              { q: "Salt and sand together is a", options: ["compound", "mixture", "element", "molecule"], answer: 1 },

              { q: "An element contains only one type of", options: ["atom", "molecule", "compound", "mixture"], answer: 0 },

            ],

            test: [

              { q: "A gas has", options: ["fixed shape", "fixed volume", "no fixed shape", "solid form"], answer: 2 },

              { q: "An element cannot be broken into simpler", options: ["atoms", "elements", "substances", "compounds"], answer: 2 },

              { q: "H2O is a", options: ["mixture", "element", "compound", "solution"], answer: 2 },

              { q: "Which is a mixture?", options: ["air", "oxygen", "water", "hydrogen"], answer: 0 },

              { q: "A compound is made of", options: ["two or more elements", "one element", "one atom", "one molecule"], answer: 0 },

              { q: "Solid to liquid change is called", options: ["melting", "evaporation", "condensation", "sublimation"], answer: 0 },

              { q: "A pure substance has", options: ["one material", "many materials", "no atoms", "no mass"], answer: 0 },

              { q: "An atom is the smallest unit of", options: ["matter", "energy", "light", "motion"], answer: 0 },

              { q: "A mixture can be separated by", options: ["chemical reaction", "physical methods", "burning", "melting"], answer: 1 },

              { q: "Which is a liquid?", options: ["ice", "water", "steam", "glass"], answer: 1 },

            ],

          },

        ],

      },

      {

        id: "preparatory",

        label: "Level 2: Preparatory",

        description:

          "Explore atomic structure, the periodic table, chemical symbols and simple reactions for junior secondary chemistry.",

        topics: [

          {

            id: "chemistry-preparatory",

            title: "Chemistry Preparatory",

            watch: "Atomic structure, the periodic table and simple reactions",

            learn: "Learn how atoms are built, how the periodic table organizes elements, the meaning of chemical symbols and how simple reactions combine substances or break them apart.",

            practice: [

              { q: "The center of an atom is the", options: ["electron shell", "nucleus", "molecule", "compound"], answer: 1 },

              { q: "Na is the symbol for", options: ["sodium", "neon", "nickel", "nitrogen"], answer: 0 },

              { q: "A simple reaction produces", options: ["a product", "an element", "energy only", "a mixture"], answer: 0 },

              { q: "In the periodic table, elements are arranged by", options: ["mass", "atomic number", "color", "size"], answer: 1 },

              { q: "Electrons are", options: ["positive", "negative", "neutral", "heavy"], answer: 1 },

            ],

            test: [

              { q: "Protons are found in the", options: ["electron shell", "nucleus", "molecule", "compound"], answer: 1 },

              { q: "Atomic number equals number of", options: ["protons", "neutrons", "electrons", "atoms"], answer: 0 },

              { q: "Chemical symbol for oxygen is", options: ["O", "Ox", "Og", "On"], answer: 0 },

              { q: "A reaction that produces heat is", options: ["exothermic", "endothermic", "isothermal", "neutral"], answer: 0 },

              { q: "The periodic table is arranged in", options: ["rows and columns", "circles", "triangles", "random order"], answer: 0 },

              { q: "Neutrons have", options: ["positive charge", "negative charge", "no charge", "mixed charge"], answer: 2 },

              { q: "A molecule is two or more", options: ["atoms", "elements", "compounds", "electrons"], answer: 0 },

              { q: "Symbol H stands for", options: ["helium", "hydrogen", "mercury", "helium"], answer: 1 },

              { q: "A compound is formed by", options: ["chemical bonding", "mixing physically", "separating", "cooling"], answer: 0 },

              { q: "Periodic groups are vertical", options: ["columns", "rows", "diagonals", "circles"], answer: 0 },

            ],

          },

        ],

      },

      {

        id: "core",

        label: "Level 3: Core",

        description:

          "Study chemical bonding, mole concept, stoichiometry, acids and bases, and a beginner introduction to organic chemistry.",

        topics: [

          {

            id: "chemistry-core",

            title: "Chemistry Core",

            watch: "Bonding, mole concept, acids, bases and organic chemistry",

            learn: "Learn how atoms join to make ionic and covalent bonds, how the mole counts particles, how to balance simple equations, the behaviour of acids and bases, and the first ideas of organic chemistry.",

            practice: [

              { q: "Ionic bonds form between", options: ["metals and non-metals", "two metals", "two gases", "two liquids"], answer: 0 },

              { q: "One mole equals", options: ["6.02×10^23 particles", "100 particles", "23 particles", "1,000 particles"], answer: 0 },

              { q: "Acids taste", options: ["bitter", "sour", "sweet", "salty"], answer: 1 },

              { q: "Bases feel", options: ["slippery", "sour", "dry", "hot"], answer: 0 },

              { q: "Organic chemistry studies", options: ["carbon compounds", "metals", "gases", "water"], answer: 0 },

            ],

            test: [

              { q: "NaCl is held together by", options: ["ionic bonds", "covalent bonds", "metallic bonds", "hydrogen bonds"], answer: 0 },

              { q: "One mole of any gas at STP occupies", options: ["22.4L", "1L", "100L", "10L"], answer: 0 },

              { q: "pH below 7 is", options: ["acidic", "basic", "neutral", "salt"], answer: 0 },

              { q: "A covalent bond shares", options: ["electrons", "protons", "neutrons", "atoms"], answer: 0 },

              { q: "Methane is a simple", options: ["organic compound", "metal", "acid", "salt"], answer: 0 },

              { q: "Stoichiometry helps calculate", options: ["reaction quantities", "sound", "light", "temperature"], answer: 0 },

              { q: "A base turns litmus paper", options: ["red", "blue", "green", "white"], answer: 1 },

              { q: "A chemical formula shows", options: ["elements in a compound", "temperature", "speed", "time"], answer: 0 },

              { q: "The mole concept uses Avogadro's number to count", options: ["particles", "grams", "liters", "joules"], answer: 0 },

              { q: "Covalent compounds are often", options: ["gases or liquids", "metals", "ions", "acids"], answer: 0 },

            ],

          },

        ],

      },

      {

        id: "jamb-mastery",

        label: "Level 4: JAMB Mastery",

        description:

          "Dive into equilibrium, electrochemistry, advanced reactions and JAMB-style question practice.",

        topics: [

          {

            id: "chemistry-mastery",

            title: "Chemistry Mastery",

            watch: "Equilibrium, electrochemistry and advanced chemistry for JAMB",

            learn: "Develop confidence with reaction equilibrium, electrochemistry concepts, advanced reaction types and structured practice for JAMB-style chemistry questions.",

            practice: [

              { q: "Equilibrium means forward and reverse reactions occur", options: ["equally", "once", "never", "slowly"], answer: 0 },

              { q: "Electrochemistry involves", options: ["electricity and chemistry", "heat only", "light only", "sound"], answer: 0 },

              { q: "A redox reaction involves", options: ["electron transfer", "heat transfer", "proton loss", "pressure"], answer: 0 },

              { q: "A catalyst speeds up a reaction without", options: ["being consumed", "slowing it", "reacting", "changing temperature"], answer: 0 },

              { q: "A strong acid has a pH", options: ["close to 0", "close to 7", "close to 14", "negative"], answer: 0 },

            ],

            test: [

              { q: "In equilibrium, concentrations are", options: ["constant", "zero", "increasing", "decreasing"], answer: 0 },

              { q: "An electrochemical cell converts chemical energy to", options: ["electrical energy", "sound", "heat only", "light only"], answer: 0 },

              { q: "Oxidation is", options: ["loss of electrons", "gain of electrons", "loss of protons", "gain of protons"], answer: 0 },

              { q: "A strong base has pH", options: ["above 7", "below 7", "7", "undefined"], answer: 0 },

              { q: "A reversible reaction can", options: ["go both ways", "go only forward", "stop immediately", "explode"], answer: 0 },

              { q: "Electrolysis uses electricity to", options: ["drive a chemical reaction", "measure heat", "create light", "reduce mass"], answer: 0 },

              { q: "A salt is formed from an acid and a", options: ["base", "metal", "gas", "solid"], answer: 0 },

              { q: "Le Chatelier's principle is about", options: ["changes in equilibrium", "pressure alone", "color change", "temperature only"], answer: 0 },

              { q: "A conductor in electrochemistry is", options: ["an electrode", "a solvent", "a product", "an acid"], answer: 0 },

              { q: "Advanced JAMB questions test", options: ["concept mastery and examination speed", "guessing skill", "memorization only", "random answers"], answer: 0 },

            ],

          },

        ],

      },

    ],

  },

  {

    id: "english",

    name: "English Language",

    color: "#9d174d",

    accent: "#fce7f3",

    levels: [

      {

        id: "foundation",

        label: "Level 1: Foundation",

        description:

          "Learn the alphabet, basic sounds, simple sentence structure, parts of speech and everyday vocabulary.",

        topics: [

          {

            id: "english-foundation",

            title: "English Foundation",

            watch: "English basics for beginners: alphabet, sentences and vocabulary",

            learn: "Start with the alphabet and sound patterns. Learn how to build simple sentences, identify nouns, verbs, adjectives and adverbs, and practise common vocabulary that supports reading and writing.",

            practice: [

              { q: "The first letter of the alphabet is", options: ["A", "B", "C", "D"], answer: 0 },

              { q: "I ___ a book.", options: ["am", "is", "are", "be"], answer: 0 },

              { q: "Happy is a", options: ["noun", "verb", "adjective", "adverb"], answer: 2 },

              { q: "Run is a", options: ["noun", "verb", "adverb", "pronoun"], answer: 1 },

              { q: "The opposite of ‘big’ is", options: ["tall", "small", "fast", "slow"], answer: 1 },

            ],

            test: [

              { q: "Choose the noun:", options: ["run", "happy", "dog", "quickly"], answer: 2 },

              { q: "She ___ my friend.", options: ["are", "is", "am", "be"], answer: 1 },

              { q: "‘Quickly’ is a", options: ["verb", "adverb", "adjective", "noun"], answer: 1 },

              { q: "The sentence subject goes", options: ["first", "last", "middle", "anywhere"], answer: 0 },

              { q: "‘This’ is a", options: ["pronoun", "noun", "verb", "adjective"], answer: 0 },

              { q: "A simple sentence has", options: ["one idea", "two ideas", "three ideas", "no idea"], answer: 0 },

              { q: "A word for ‘happy’ is", options: ["sad", "angry", "glad", "slow"], answer: 2 },

              { q: "‘I am reading’ is", options: ["present simple", "present continuous", "past simple", "future"], answer: 1 },

              { q: "‘She walks’ is", options: ["plural", "singular", "future", "past"], answer: 1 },

              { q: "‘Book’ is a", options: ["verb", "adverb", "noun", "preposition"], answer: 2 },

            ],

          },

        ],

      },

      {

        id: "preparatory",

        label: "Level 2: Preparatory",

        description:

          "Learn tenses, sentence formation, common grammar mistakes and reading short passages.",

        topics: [

          {

            id: "english-preparatory",

            title: "English Preparatory",

            watch: "English tenses, sentence formation and reading passages",

            learn: "Study the main tenses, build correct sentences, avoid common grammar mistakes and practise reading short passages for meaning. These skills help you move beyond beginner English.",

            practice: [

              { q: "Yesterday I ___ to school.", options: ["go", "went", "gone", "will go"], answer: 1 },

              { q: "She has ___ her homework.", options: ["do", "does", "done", "doing"], answer: 2 },

              { q: "Choose the correct sentence:", options: ["Him is happy", "He are happy", "He is happy", "He am happy"], answer: 2 },

              { q: "A short passage is useful for", options: ["grammar only", "meaning and context", "math", "science"], answer: 1 },

              { q: "‘Their’ shows", options: ["possession", "action", "time", "place"], answer: 0 },

            ],

            test: [

              { q: "I will ___ tomorrow.", options: ["go", "went", "gone", "going"], answer: 0 },

              { q: "She ___ a cake now.", options: ["bakes", "is baking", "baked", "will bake"], answer: 1 },

              { q: "Correct sentence is", options: ["They is happy", "They are happy", "They am happy", "They be happy"], answer: 1 },

              { q: "A passage asks you to", options: ["memorize words", "understand meaning", "ignore context", "count letters"], answer: 1 },

              { q: "Which is a noun?", options: ["run", "beautiful", "teacher", "quickly"], answer: 2 },

              { q: "‘I have eaten’ is", options: ["present perfect", "past simple", "future", "present simple"], answer: 0 },

              { q: "‘Could’ is a", options: ["noun", "verb", "modal verb", "adjective"], answer: 2 },

              { q: "A common mistake is using ‘their’ instead of", options: ["there", "they", "then", "them"], answer: 0 },

              { q: "Sentence order is usually", options: ["subject-verb-object", "verb-object-subject", "object-subject-verb", "subject-object-verb"], answer: 0 },

              { q: "‘He plays football’ is", options: ["present simple", "present continuous", "past simple", "future"], answer: 0 },

            ],

          },

        ],

      },

      {

        id: "core",

        label: "Level 3: Core",

        description:

          "Practice comprehension, lexis, essay basics and vocabulary building for more advanced English.",

        topics: [

          {

            id: "english-core",

            title: "English Core",

            watch: "Comprehension, essay basics and vocabulary building",

            learn: "Improve your comprehension skills with passage reading, practise lexis and structure questions, learn essay planning basics, and build strong vocabulary for JAMB English.",

            practice: [

              { q: "A summary is", options: ["a short version of a passage", "a long essay", "a poem", "a dictionary"], answer: 0 },

              { q: "‘Lexis’ refers to", options: ["grammar", "word choice", "writing style", "spelling"], answer: 1 },

              { q: "An essay needs", options: ["introduction, body and conclusion", "only a conclusion", "no structure", "only one sentence"], answer: 0 },

              { q: "Meaning from context is found in", options: ["surrounding words", "grammar only", "spelling", "punctuation"], answer: 0 },

              { q: "A synonym for ‘happy’ is", options: ["sad", "glad", "angry", "tired"], answer: 1 },

            ],

            test: [

              { q: "Comprehension questions usually ask for", options: ["main idea", "color", "sound", "shape"], answer: 0 },

              { q: "A good opening sentence in an essay is", options: ["clear and focused", "random", "too long", "vague"], answer: 0 },

              { q: "‘He sprinted quickly’ uses", options: ["adjective", "adverb", "noun", "pronoun"], answer: 1 },

              { q: "‘Antonym’ means", options: ["same meaning", "opposite meaning", "spelling mistake", "sound alike"], answer: 1 },

              { q: "A passage summary should be", options: ["short and accurate", "long and detailed", "opinionated", "random"], answer: 0 },

              { q: "Lexis & structure questions focus on", options: ["word choice and grammar", "math", "science", "history"], answer: 0 },

              { q: "A good paragraph has", options: ["one main idea", "many unrelated ideas", "no idea", "random words"], answer: 0 },

              { q: "‘Despite’ is used to show", options: ["contrast", "time", "location", "quantity"], answer: 0 },

              { q: "‘They were singing’ is", options: ["past continuous", "past simple", "present perfect", "future"], answer: 0 },

              { q: "Reading for meaning helps you avoid", options: ["wrong answers", "fast answers", "grammar", "spelling"], answer: 0 },

            ],

          },

        ],

      },

      {

        id: "jamb-mastery",

        label: "Level 4: JAMB Mastery",

        description:

          "Master advanced comprehension, summary writing, grammar and JAMB-style English questions.",

        topics: [

          {

            id: "english-mastery",

            title: "English Mastery",

            watch: "JAMB English practice: comprehension, summaries and advanced grammar",

            learn: "This level builds exam readiness with advanced passage analysis, summary practice, deeper grammar mastery and real exam-style questions that reflect JAMB English.",

            practice: [

              { q: "A good summary should be", options: ["short and clear", "long and detailed", "opinionated", "confusing"], answer: 0 },

              { q: "‘Affect’ and ‘effect’ are examples of", options: ["homonyms", "confusing word pairs", "verbs only", "adjectives only"], answer: 1 },

              { q: "Comprehension questions often ask for", options: ["the writer’s message", "the font", "the color", "the page number"], answer: 0 },

              { q: "Grammar mastery means", options: ["correct sentence structure", "speaking loudly", "writing fast", "memorizing stories"], answer: 0 },

              { q: "A summary removes", options: ["unnecessary details", "main ideas", "the title", "the author"], answer: 0 },

            ],

            test: [

              { q: "Which is the best summary sentence?", options: ["The passage explains the main idea clearly.", "The passage is about many things.", "The passage is long.", "The passage uses words."], answer: 0 },

              { q: "A correct sentence is", options: ["She has gone home.", "She have gone home.", "She gone home.", "She going home."], answer: 0 },

              { q: "‘Their’ and ‘there’ are", options: ["different words", "same word", "numbers", "symbols"], answer: 0 },

              { q: "Advanced comprehension tests", options: ["understanding and inference", "spelling only", "drawing pictures", "counting words"], answer: 0 },

              { q: "Which is a verb?", options: ["run", "blue", "city", "happy"], answer: 0 },

              { q: "A summary should be", options: ["short and accurate", "long and detailed", "unrelated", "confusing"], answer: 0 },

              { q: "Correct grammar helps you", options: ["score higher", "write less", "skip questions", "guess answers"], answer: 0 },

              { q: "A JAMB-style English question rewards", options: ["practice and understanding", "guessing", "speed only", "no study"], answer: 0 },

              { q: "‘Because’ is used to show", options: ["reason", "time", "place", "quantity"], answer: 0 },

              { q: "Which sentence is correct?", options: ["They were reading.", "They reading.", "They is reading.", "They are read."], answer: 0 },

            ],

          },

        ],

      },

    ],

  },

];



const MOCK_EXAM = [

  {

    q: "What is 40% of 80?",

    options: ["12", "24", "32", "40"],

    answer: 2,

  },

  {

    q: "Which law explains inertia?",

    options: ["Newton's 1st", "Newton's 2nd", "Newton's 3rd", "Hooke's"],

    answer: 0,

  },

  {

    q: "Which is a compound?",

    options: ["O2", "NaCl", "Fe", "Ar"],

    answer: 1,

  },

  {

    q: "Choose the noun: 'teacher' or 'teach'?",

    options: ["teacher", "teach", "teaching", "taught"],

    answer: 0,

  },

  {

    q: "If V = 10V and I = 2A, R = ?",

    options: ["2Ω", "5Ω", "20Ω", "8Ω"],

    answer: 1,

  },

  {

    q: "A scalar quantity is", options: ["velocity", "speed", "displacement", "force"], answer: 1 },

  {

    q: "pH 2 is", options: ["neutral", "basic", "acidic", "unknown"], answer: 2 },

  {

    q: "sin 30° equals", options: ["0", "1/2", "1", "√2/2"], answer: 1 },

  {

    q: "A summary should be", options: ["long and detailed", "short and clear", "opinionated", "confusing"], answer: 1 },

  {

    q: "Which is a correct sentence?", options: ["He have gone.", "He has gone.", "He has went.", "He gone."], answer: 1 },

];



function buildInitialProgress() {

  return CURRICULUM.reduce((subjectAcc, subject) => {

    subjectAcc[subject.id] = subject.levels.reduce((levelAcc, level) => {

      levelAcc[level.id] = level.topics.reduce((topicAcc, topic) => {

        topicAcc[topic.id] = { passed: false, score: 0 };

        return topicAcc;

      }, {});

      return levelAcc;

    }, {});

    return subjectAcc;

  }, {});

}



function loadProgress() {

  try {

    const raw = localStorage.getItem("jambProgress");

    if (!raw) return buildInitialProgress();

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" ? parsed : buildInitialProgress();

  } catch (error) {

    return buildInitialProgress();

  }

}



function formatScore(value) {

  return `${Math.round(value)}%`;

}



function formatTime(seconds) {

  const minutes = Math.floor(seconds / 60);

  const secs = seconds % 60;

  return `${minutes}:${secs.toString().padStart(2, "0")}`;

}



function isTopicUnlocked(subjectId, levelIndex, topicIndex, progress) {

  const subject = CURRICULUM.find((item) => item.id === subjectId);

  if (!subject) return false;

  if (levelIndex === 0 && topicIndex === 0) return true;

  const level = subject.levels[levelIndex];

  const topic = level.topics[topicIndex];

  if (!topic) return false;

  if (topicIndex > 0) {

    const previousTopic = level.topics[topicIndex - 1];

    return progress[subjectId][level.id][previousTopic.id]?.passed;

  }

  const prevLevel = subject.levels[levelIndex - 1];

  const prevTopic = prevLevel.topics[prevLevel.topics.length - 1];

  return progress[subjectId][prevLevel.id][prevTopic.id]?.passed;

}



function getSubjectProgress(subject, progress) {

  const total = subject.levels.reduce((count, level) => count + level.topics.length, 0);

  const passed = subject.levels.reduce((count, level) => {

    return (

      count +

      level.topics.reduce((levelCount, topic) => {

        return levelCount + (progress[subject.id][level.id][topic.id]?.passed ? 1 : 0);

      }, 0)

    );

  }, 0);

  return total === 0 ? 0 : Math.round((passed / total) * 100);

}



function getOverallProgress(progress) {

  const total = CURRICULUM.reduce((count, subject) => count + subject.levels.reduce((levelCount, level) => levelCount + level.topics.length, 0), 0);

  const passed = CURRICULUM.reduce(

    (count, subject) =>

      count +

      subject.levels.reduce((levelCount, level) => {

        return (

          levelCount +

          level.topics.reduce((topicCount, topic) => topicCount + (progress[subject.id][level.id][topic.id]?.passed ? 1 : 0), 0)

        );

      }, 0),

    0

  );

  return total === 0 ? 0 : Math.round((passed / total) * 100);

}



function findNextUnlockedTopic(subjectId, progress) {

  const subject = CURRICULUM.find((item) => item.id === subjectId);

  if (!subject) return { levelIndex: 0, topicIndex: 0 };

  for (let levelIndex = 0; levelIndex < subject.levels.length; levelIndex += 1) {

    const level = subject.levels[levelIndex];

    for (let topicIndex = 0; topicIndex < level.topics.length; topicIndex += 1) {

      if (isTopicUnlocked(subjectId, levelIndex, topicIndex, progress)) {

        const topic = level.topics[topicIndex];

        if (!progress[subjectId][level.id][topic.id]?.passed) {

          return { levelIndex, topicIndex };

        }

      }

    }

  }

  return { levelIndex: subject.levels.length - 1, topicIndex: subject.levels[subject.levels.length - 1].topics.length - 1 };

}



function isMockExamUnlocked(progress) {

  return CURRICULUM.every((subject) =>

    subject.levels[subject.levels.length - 1].topics.every((topic) => progress[subject.id][subject.levels[subject.levels.length - 1].id][topic.id]?.passed)

  );

}



function useExamTimer(active, setSeconds) {

  useEffect(() => {

    if (!active) return undefined;

    const timer = window.setInterval(() => setSeconds((value) => Math.max(value - 1, 0)), 1000);

    return () => window.clearInterval(timer);

  }, [active, setSeconds]);

}


// Authentication functions
function loadAuthState() {
  try {
    const authData = localStorage.getItem("jambAuth");
    if (!authData) return { isAuthenticated: false, user: null };
    const parsed = JSON.parse(authData);
    return parsed && typeof parsed === "object" ? parsed : { isAuthenticated: false, user: null };
  } catch (error) {
    return { isAuthenticated: false, user: null };
  }
}

function saveAuthState(authState) {
  try {
    localStorage.setItem("jambAuth", JSON.stringify(authState));
  } catch (error) {
    console.error("Failed to save auth state:", error);
  }
}

export default function JambSuccessGuide() {
  const [progress, setProgress] = useState(loadProgress);
  const [authState, setAuthState] = useState(loadAuthState);

  const [selectedSubject, setSelectedSubject] = useState(CURRICULUM[0].id);

  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);

  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  const [page, setPage] = useState(authState.isAuthenticated ? "dashboard" : "login");

  const [topicTab, setTopicTab] = useState("learn");

  const [practiceAnswers, setPracticeAnswers] = useState({});

  const [testAnswers, setTestAnswers] = useState({});

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  // Register form state
  const [registerForm, setRegisterForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Authentication functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLogging(true);

    try {
      // Replace with your actual backend API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newAuthState = {
          isAuthenticated: true,
          user: data.user,
          token: data.token,
        };
        setAuthState(newAuthState);
        saveAuthState(newAuthState);
        setPage("dashboard");
      } else {
        setLoginError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError("Password must be at least 6 characters");
      return;
    }

    setIsRegistering(true);

    try {
      // Replace with your actual backend API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newAuthState = {
          isAuthenticated: true,
          user: data.user,
          token: data.token,
        };
        setAuthState(newAuthState);
        saveAuthState(newAuthState);
        setPage("dashboard");
      } else {
        setRegisterError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setRegisterError("Network error. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    const newAuthState = { isAuthenticated: false, user: null, token: null };
    setAuthState(newAuthState);
    saveAuthState(newAuthState);
    setPage("login");
  };

  const [topicResult, setTopicResult] = useState(null);

  const [mockActive, setMockActive] = useState(false);

  const [mockSeconds, setMockSeconds] = useState(2 * 60 * 60);

  const [mockAnswers, setMockAnswers] = useState({});

  const [mockResult, setMockResult] = useState(null);



  useEffect(() => {

    localStorage.setItem("jambProgress", JSON.stringify(progress));

  }, [progress]);



  const currentSubject = useMemo(

    () => CURRICULUM.find((subject) => subject.id === selectedSubject) || CURRICULUM[0],

    [selectedSubject]

  );



  const currentLevel = currentSubject.levels[selectedLevelIndex];

  const currentTopic = currentLevel.topics[selectedTopicIndex];

  const currentTopicStatus = progress[selectedSubject][currentLevel.id][currentTopic.id];

  const currentTopicUnlocked = isTopicUnlocked(selectedSubject, selectedLevelIndex, selectedTopicIndex, progress);

  const overallProgress = useMemo(() => getOverallProgress(progress), [progress]);

  const subjectProgress = useMemo(() => getSubjectProgress(currentSubject, progress), [currentSubject, progress]);

  const mockUnlocked = useMemo(() => isMockExamUnlocked(progress), [progress]);



  useExamTimer(mockActive && !mockResult, setMockSeconds);



  function handleSelectSubject(subjectId) {

    const nextTopic = findNextUnlockedTopic(subjectId, progress);

    setSelectedSubject(subjectId);

    setSelectedLevelIndex(nextTopic.levelIndex);

    setSelectedTopicIndex(nextTopic.topicIndex);

    setPage("subject");

    setTopicTab("learn");

    setTopicResult(null);

  }



  function handleSelectTopic(levelIndex, topicIndex) {

    setSelectedLevelIndex(levelIndex);

    setSelectedTopicIndex(topicIndex);

    setPage("topic");

    setTopicTab("learn");

    setTopicResult(null);

    setTestAnswers({});

    setPracticeAnswers({});

  }



  function navigateToDashboard() {

    setPage("dashboard");

    setTopicResult(null);

    setTopicTab("learn");

  }



  function handlePracticeAnswer(index, optionIndex) {

    setPracticeAnswers((current) => ({ ...current, [index]: optionIndex }));

  }



  function handleTestAnswer(index, optionIndex) {

    setTestAnswers((current) => ({ ...current, [index]: optionIndex }));

  }



  function submitTopicTest() {

    const total = currentTopic.test.length;

    const correct = currentTopic.test.reduce((count, question, index) => {

      return count + (testAnswers[index] === question.answer ? 1 : 0);

    }, 0);

    const score = Math.round((correct / total) * 100);

    const passed = score >= 70;

    const missed = currentTopic.test

      .map((question, index) => ({ question, index }))

      .filter((item) => testAnswers[item.index] !== item.question.answer)

      .map((item) => item.question.q);



    setTopicResult({ score, passed, missed, correct, total });



    if (passed) {

      setProgress((current) => ({

        ...current,

        [selectedSubject]: {

          ...current[selectedSubject],

          [currentLevel.id]: {

            ...current[selectedSubject][currentLevel.id],

            [currentTopic.id]: {

              passed: true,

              score: Math.max(current[selectedSubject][currentLevel.id][currentTopic.id].score || 0, score),

            },

          },

        },

      }));

    }

  }



  function resetTopicReview() {

    setTopicResult(null);

    setTestAnswers({});

    setPracticeAnswers({});

  }



  function launchMockExam() {

    setMockActive(true);

    setPage("mock");

    setMockSeconds(2 * 60 * 60);

    setMockResult(null);

    setMockAnswers({});

  }



  function submitMockExam() {

    const total = MOCK_EXAM.length;

    const correct = MOCK_EXAM.reduce((count, question, index) => {

      return count + (mockAnswers[index] === question.answer ? 1 : 0);

    }, 0);

    const score = Math.round((correct / total) * 100);

    const advice = score >= 70 ? "You are ready for full JAMB simulation. Review any missed topics and keep practising." : "Review the topics you missed and retake the mock exam after strengthening your foundation.";

    setMockResult({ score, correct, total, advice });

    setMockActive(false);

  }



  const nextStudyTopic = findNextUnlockedTopic(selectedSubject, progress);

  const nextStudyLevel = currentSubject.levels[nextStudyTopic.levelIndex];

  const nextStudyTopicData = nextStudyLevel.topics[nextStudyTopic.topicIndex];

  const nextStudyLabel = `${nextStudyLevel.label} → ${nextStudyTopicData.title}`;



  return (

    <div>

      {page === "dashboard" && (

        <section className="dashboard">

          <div className="dashboard-head">

            <div>

              <h2>Dashboard</h2>

              <p>Follow the structured path: Foundation → Preparatory → Core → JAMB Mastery.</p>

            </div>

            <button className="primary-button" onClick={() => handleSelectTopic(nextStudyTopic.levelIndex, nextStudyTopic.topicIndex)}>

              Continue learning

            </button>

          </div>



          <div className="progress-card">

            <div className="progress-card-header">

              <div>

                <span>Overall completion</span>

                <h3>{overallProgress}% complete</h3>

              </div>

              <div className="progress-bar">

                <div className="progress-fill" style={{ width: `${overallProgress}%` }} />

              </div>

            </div>

          </div>



          <div className="subject-grid">

            {CURRICULUM.map((subject) => {

              const subjectPct = getSubjectProgress(subject, progress);

              const nextTopic = findNextUnlockedTopic(subject.id, progress);

              const nextLevel = subject.levels[nextTopic.levelIndex];

              return (

                <div key={subject.id} className="subject-card">

                  <div className="subject-title" style={{ borderColor: subject.color }}>

                    <span>{subject.name}</span>

                    <strong>{subjectPct}%</strong>

                  </div>

                  <p>{nextLevel.label} unlocked after earlier concepts.</p>

                  <div className="progress-bar">

                    <div className="progress-fill" style={{ width: `${subjectPct}%`, background: subject.color }} />

                  </div>

                  <div className="subject-footer">

                    <small>Next: {nextLevel.label}</small>

                    <button className="tertiary-button" onClick={() => handleSelectSubject(subject.id)}>

                      Open subject

                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        </section>

      )}



      {page === "subject" && (

        <section className="subject-panel">

          <div className="section-top">

            <div>

              <button className="link-button" onClick={navigateToDashboard}>&larr; Back to dashboard</button>

              <h2>{currentSubject.name}</h2>

              <p>{currentSubject.levels[selectedLevelIndex].description}</p>

            </div>

            <div className="subject-score-card" style={{ borderColor: currentSubject.color }}>

              <span>Subject progress</span>

              <strong>{subjectProgress}%</strong>

            </div>

          </div>



          <div className="level-list">

            {currentSubject.levels.map((level, levelIndex) => (

              <div key={level.id} className="level-card">

                <div className="level-card-header">

                  <div>

                    <span>{level.label}</span>

                    <h3>{level.description.split(". ")[0]}</h3>

                  </div>

                  <span className="tag">{levelIndex === 0 ? "First step" : "Locked until previous level passed"}</span>

                </div>

                <div className="topic-list">

                  {level.topics.map((topic, topicIndex) => {

                    const unlocked = isTopicUnlocked(currentSubject.id, levelIndex, topicIndex, progress);

                    const passed = progress[currentSubject.id][level.id][topic.id]?.passed;

                    return (

                      <button

                        key={topic.id}

                        className={`topic-item ${unlocked ? "unlocked" : "locked"}`}

                        onClick={() => unlocked && handleSelectTopic(levelIndex, topicIndex)}

                        disabled={!unlocked}

                      >

                        <div>

                          <strong>{topic.title}</strong>

                          <small>{passed ? "Completed" : unlocked ? "Ready" : "Locked"}</small>

                        </div>

                        <span>{passed ? "✓" : unlocked ? "→" : "🔒"}</span>

                      </button>

                    );

                  })}

                </div>

              </div>

            ))}

          </div>

        </section>

      )}



      {page === "topic" && (

        <section className="topic-panel">

          <div className="section-top">

            <div>

              <button className="link-button" onClick={() => setPage("subject")}>&larr; Back to subject</button>

              <h2>{currentTopic.title}</h2>

              <p>{currentLevel.description}</p>

            </div>

            <div className="topic-status-card" style={{ borderColor: currentSubject.color }}>

              <span>{currentLevel.label}</span>

              <strong>{currentTopicUnlocked ? "Unlocked" : "Locked"}</strong>

              <div className="small-progress-bar">

                <div

                  className="progress-fill"

                  style={{ width: `${currentTopicStatus.passed ? 100 : 25}%`, background: currentSubject.color }}

                />

              </div>

            </div>

          </div>



          <div className="topic-tabs">

            {['learn', 'watch', 'practice', 'test'].map((tab) => (

              <button

                key={tab}

                className={`tab-button ${topicTab === tab ? 'active' : ''}`}

                onClick={() => setTopicTab(tab)}

              >

                {tab.charAt(0).toUpperCase() + tab.slice(1)}

              </button>

            ))}

          </div>



          {topicTab === 'learn' && (

            <div className="topic-card">

              <h3>Learn</h3>

              <p>{currentTopic.learn}</p>

              <div className="youtube-link">

                <a

                  href={`https://www.youtube.com/results?search_query=JAMB+${encodeURIComponent(currentSubject.name + ' ' + currentTopic.title)}`}

                  target="_blank"

                  rel="noreferrer"

                >

                  Watch related videos on YouTube

                </a>

              </div>

            </div>

          )}



          {topicTab === 'watch' && (

            <div className="topic-card">

              <h3>Watch</h3>

              <p>Open a curated YouTube search for this topic and follow the beginner-friendly lessons.</p>

              <a

                className="watch-card"

                href={`https://www.youtube.com/results?search_query=JAMB+${encodeURIComponent(currentSubject.name + ' ' + currentTopic.watch)}`}

                target="_blank"

                rel="noreferrer"

              >

                Search YouTube: JAMB {currentSubject.name} {currentTopic.watch}

              </a>

            </div>

          )}



          {topicTab === 'practice' && (

            <div className="topic-card">

              <h3>Practice</h3>

              <p>Answer the practice questions to check your understanding. You can review and retry before taking the test.</p>

              <ol className="question-list">

                {currentTopic.practice.map((question, index) => (

                  <li key={index} className="question-item">

                    <p>{question.q}</p>

                    <div className="options-grid">

                      {question.options.map((option, optionIndex) => (

                        <button

                          key={optionIndex}

                          className={`option-button ${practiceAnswers[index] === optionIndex ? 'selected' : ''}`}

                          onClick={() => handlePracticeAnswer(index, optionIndex)}

                        >

                          {option}

                        </button>

                      ))}

                    </div>

                  </li>

                ))}

              </ol>

            </div>

          )}



          {topicTab === 'test' && (

            <div className="topic-card">

              <h3>Test</h3>

              <p>This test must be passed with 70% or more to unlock the next level.</p>

              <ol className="question-list">

                {currentTopic.test.map((question, index) => (

                  <li key={index} className="question-item">

                    <p>{question.q}</p>

                    <div className="options-grid">

                      {question.options.map((option, optionIndex) => (

                        <button

                          key={optionIndex}

                          className={`option-button ${testAnswers[index] === optionIndex ? 'selected' : ''}`}

                          onClick={() => handleTestAnswer(index, optionIndex)}

                        >

                          {option}

                        </button>

                      ))}

                    </div>

                  </li>

                ))}

              </ol>

            </div>

          </section>

        )}



{page === "topic" && (

  <section className="topic-panel">

    <div className="section-top">

      <div>

        <button className="link-button" onClick={() => setPage("subject")}>&larr; Back to subject</button>

        <h2>{currentTopic.title}</h2>

        <p>{currentLevel.description}</p>

      </div>

      <div className="topic-status-card" style={{ borderColor: currentSubject.color }}>

        <span>{currentLevel.label}</span>

        <strong>{currentTopicUnlocked ? "Unlocked" : "Locked"}</strong>

        <div className="small-progress-bar">

          <div

            className="progress-fill"

            style={{ width: `${currentTopicStatus.passed ? 100 : 25}%`, background: currentSubject.color }}

          />

        </div>

      </div>

    </div>

  )}

)}

</section>

</div>

  );

