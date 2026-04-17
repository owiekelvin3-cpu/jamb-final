-- JAMB CBT Platform - Sample Data
-- Real JAMB-style questions and subjects

-- Insert Subjects
INSERT INTO subjects (name, code, description, icon, color, total_questions, exam_duration) VALUES
('Mathematics', 'MATH', 'Complete JAMB Mathematics syllabus including algebra, geometry, trigonometry, and calculus', 'calculator', '#2563EB', 60, 90),
('English Language', 'ENG', 'English Language comprehension, grammar, vocabulary, and essay writing', 'book', '#059669', 60, 60),
('Physics', 'PHY', 'Physics covering mechanics, electricity, magnetism, and modern physics', 'atom', '#DC2626', 60, 90),
('Chemistry', 'CHEM', 'Chemistry including organic, inorganic, physical, and analytical chemistry', 'flask', '#7C3AED', 60, 90),
('Biology', 'BIO', 'Biology covering cell biology, genetics, ecology, and human physiology', 'dna', '#059669', 60, 90),
('Government', 'GOV', 'Nigerian government, political systems, and civic education', 'building', '#EA580C', 60, 60),
('Literature in English', 'LIT', 'African and English literature, drama, poetry, and prose', 'pen', '#0891B2', 60, 60),
('Economics', 'ECO', 'Microeconomics, macroeconomics, and Nigerian economic systems', 'chart', '#0D9488', 60, 60);

-- Mathematics Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
-- Basic Algebra
((SELECT id FROM subjects WHERE code = 'MATH'), 'Algebra', 'easy', 
 'Solve for x: 2x + 5 = 15', 
 'x = 5', 'x = 10', 'x = 15', 'x = 20', 
 'A', '2x + 5 = 15, so 2x = 10, x = 5'),

((SELECT id FROM subjects WHERE code = 'MATH'), 'Algebra', 'medium',
 'If 3x - 7 = 14, what is x?',
 '5', '6', '7', '8',
 'C', '3x - 7 = 14, so 3x = 21, x = 7'),

-- Geometry
((SELECT id FROM subjects WHERE code = 'MATH'), 'Geometry', 'easy',
 'What is the sum of angles in a triangle?',
 '90°', '180°', '270°', '360°',
 'B', 'The sum of angles in any triangle is always 180°'),

((SELECT id FROM subjects WHERE code = 'MATH'), 'Geometry', 'medium',
 'A square has a side length of 6cm. What is its area?',
 '12cm²', '24cm²', '36cm²', '48cm²',
 'C', 'Area of square = side² = 6² = 36cm²'),

-- Trigonometry
((SELECT id FROM subjects WHERE code = 'MATH'), 'Trigonometry', 'medium',
 'What is sin(30°)?',
 '0', '0.5', '0.866', '1',
 'B', 'sin(30°) = 0.5'),

((SELECT id FROM subjects WHERE code = 'MATH'), 'Trigonometry', 'hard',
 'In a right triangle, if opposite = 3 and adjacent = 4, what is tan(angle)?',
 '0.75', '1.33', '0.8', '1.25',
 'A', 'tan(angle) = opposite/adjacent = 3/4 = 0.75'),

-- Calculus
((SELECT id FROM subjects WHERE code = 'MATH'), 'Calculus', 'medium',
 'What is the derivative of x²?',
 'x', '2x', 'x²', '2',
 'B', 'Using power rule: d/dx(x²) = 2x^(2-1) = 2x'),

((SELECT id FROM subjects WHERE code = 'MATH'), 'Calculus', 'hard',
 'What is the integral of 2x dx?',
 'x² + C', 'x + C', '2x² + C', 'x²/2 + C',
 'A', 'Integral of 2x dx = 2x^(1+1)/(1+1) + C = x² + C');

-- English Language Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
-- Grammar
((SELECT id FROM subjects WHERE code = 'ENG'), 'Grammar', 'easy',
 'Which word is a noun in the sentence: "The cat sleeps peacefully"?',
 'The', 'cat', 'sleeps', 'peacefully',
 'B', 'Cat is a noun as it names an animal'),

((SELECT id FROM subjects WHERE code = 'ENG'), 'Grammar', 'medium',
 'Choose the correct verb: "She ___ to school every day."',
 'go', 'goes', 'going', 'went',
 'B', 'Third person singular present tense takes "goes"'),

-- Comprehension
((SELECT id FROM subjects WHERE code = 'ENG'), 'Comprehension', 'medium',
 'What is the main idea of a passage?',
 'A supporting detail', 'The central theme', 'A minor point', 'The conclusion',
 'B', 'The main idea is the central theme of the passage'),

((SELECT id FROM subjects WHERE code = 'ENG'), 'Comprehension', 'hard',
 'In literature, what does "protagonist" mean?',
 'Antagonist', 'Main character', 'Supporting character', 'Narrator',
 'B', 'Protagonist refers to the main character in a story'),

-- Vocabulary
((SELECT id FROM subjects WHERE code = 'ENG'), 'Vocabulary', 'easy',
 'What does "ubiquitous" mean?',
 'Rare', 'Everywhere', 'Hidden', 'Ancient',
 'B', 'Ubiquitous means present, appearing, or found everywhere'),

-- Essay Writing
((SELECT id FROM subjects WHERE code = 'ENG'), 'Essay Writing', 'medium',
 'What should be included in an essay introduction?',
 'Only the thesis', 'Hook, background, and thesis', 'Just examples', 'Only background',
 'B', 'A good introduction has a hook, background information, and a thesis statement'),

((SELECT id FROM subjects WHERE code = 'ENG'), 'Essay Writing', 'hard',
 'How many paragraphs are typically in a standard essay?',
 '3', '4', '5', '6',
 'C', 'A standard essay typically has 5 paragraphs: introduction, 3 body paragraphs, and conclusion');

-- Physics Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
-- Motion
((SELECT id FROM subjects WHERE code = 'PHY'), 'Motion', 'easy',
 'What is the SI unit of velocity?',
 'm/s', 'm/s²', 'km/h', 'm',
 'A', 'Velocity is measured in meters per second (m/s)'),

((SELECT id FROM subjects WHERE code = 'PHY'), 'Motion', 'medium',
 'If a car travels 100km in 2 hours, what is its average speed?',
 '25 km/h', '50 km/h', '75 km/h', '100 km/h',
 'B', 'Average speed = distance/time = 100km/2h = 50 km/h'),

-- Forces
((SELECT id FROM subjects WHERE code = 'PHY'), 'Forces', 'easy',
 'What is Newton''s First Law also known as?',
 'Law of Inertia', 'Law of Acceleration', 'Law of Action-Reaction', 'Law of Gravity',
 'A', 'Newton''s First Law is also known as the Law of Inertia'),

((SELECT id FROM subjects WHERE code = 'PHY'), 'Forces', 'medium',
 'What force opposes motion between two surfaces in contact?',
 'Gravity', 'Friction', 'Tension', 'Normal force',
 'B', 'Friction is the force that opposes motion between surfaces in contact'),

-- Energy
((SELECT id FROM subjects WHERE code = 'PHY'), 'Energy', 'easy',
 'What is the SI unit of energy?',
 'Watt', 'Joule', 'Newton', 'Pascal',
 'B', 'Energy is measured in Joules'),

((SELECT id FROM subjects WHERE code = 'PHY'), 'Energy', 'medium',
 'What type of energy is stored in a stretched rubber band?',
 'Kinetic', 'Potential', 'Thermal', 'Chemical',
 'B', 'Elastic potential energy is stored in stretched objects'),

-- Electricity
((SELECT id FROM subjects WHERE code = 'PHY'), 'Electricity', 'easy',
 'What is the unit of electric current?',
 'Volt', 'Ohm', 'Ampere', 'Watt',
 'C', 'Electric current is measured in Amperes (A)'),

((SELECT id FROM subjects WHERE code = 'PHY'), 'Electricity', 'hard',
 'In a series circuit, if one bulb burns out, what happens to the other bulbs?',
 'They become brighter', 'They go out', 'They stay the same', 'They become dimmer',
 'B', 'In a series circuit, if one component fails, the entire circuit is broken and all components stop working');

-- Chemistry Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
-- Atomic Structure
((SELECT id FROM subjects WHERE code = 'CHEM'), 'Atomic Structure', 'easy',
 'What is the atomic number of Carbon?',
 '4', '6', '8', '12',
 'B', 'Carbon has atomic number 6, meaning it has 6 protons'),

((SELECT id FROM subjects WHERE code = 'CHEM'), 'Atomic Structure', 'medium',
 'Which particle has a positive charge?',
 'Electron', 'Neutron', 'Proton', 'Atom',
 'C', 'Protons have positive charge, electrons have negative charge, neutrons are neutral'),

-- Chemical Bonds
((SELECT id FROM subjects WHERE code = 'CHEM'), 'Chemical Bonds', 'easy',
 'What type of bond forms between metal and non-metal?',
 'Covalent', 'Ionic', 'Metallic', 'Hydrogen',
 'B', 'Ionic bonds form between metals and non-metals through electron transfer'),

((SELECT id FROM subjects WHERE code = 'CHEM'), 'Chemical Bonds', 'medium',
 'In H2O, what type of bond exists between hydrogen and oxygen?',
 'Ionic', 'Covalent', 'Metallic', 'Van der Waals',
 'B', 'Water molecules have covalent bonds between hydrogen and oxygen atoms'),

-- Chemical Reactions
((SELECT id FROM subjects WHERE code = 'CHEM'), 'Chemical Reactions', 'easy',
 'What is the product of 2H2 + O2?',
 'H2O', 'H2O2', '2H2O', 'H2 + O2',
 'C', '2H2 + O2 produces 2H2O (water)'),

((SELECT id FROM subjects WHERE code = 'CHEM'), 'Chemical Reactions', 'medium',
 'What type of reaction is: A + B -> AB?',
 'Decomposition', 'Synthesis', 'Single replacement', 'Double replacement',
 'B', 'Synthesis (combination) reaction where two substances combine to form one product'),

-- Organic Chemistry
((SELECT id FROM subjects WHERE code = 'CHEM'), 'Organic Chemistry', 'medium',
 'What is the general formula for alkanes?',
 'CnH2n', 'CnH2n+2', 'CnH2n-2', 'CnH2n+1',
 'B', 'Alkanes have the general formula CnH2n+2'),

((SELECT id FROM subjects WHERE code = 'CHEM'), 'Organic Chemistry', 'hard',
 'How many bonds can carbon form?',
 '2', '3', '4', '5',
 'C', 'Carbon can form 4 covalent bonds due to its 4 valence electrons');

-- Biology Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
-- Cell Biology
((SELECT id FROM subjects WHERE code = 'BIO'), 'Cell Biology', 'easy',
 'What is the basic unit of life?',
 'Atom', 'Molecule', 'Cell', 'Tissue',
 'C', 'The cell is the basic structural and functional unit of life'),

((SELECT id FROM subjects WHERE code = 'BIO'), 'Cell Biology', 'medium',
 'Which organelle is known as the "powerhouse of the cell"?',
 'Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus',
 'B', 'Mitochondria produce ATP through cellular respiration'),

-- Genetics
((SELECT id FROM subjects WHERE code = 'BIO'), 'Genetics', 'easy',
 'What is DNA?',
 'Deoxyribonucleic acid', 'Ribonucleic acid', 'Protein', 'Lipid',
 'A', 'DNA stands for Deoxyribonucleic acid'),

((SELECT id FROM subjects WHERE code = 'BIO'), 'Genetics', 'medium',
 'How many chromosomes do humans normally have?',
 '23', '46', '69', '92',
 'B', 'Humans have 46 chromosomes (23 pairs)'),

-- Ecology
((SELECT id FROM subjects WHERE code = 'BIO'), 'Ecology', 'easy',
 'What is the ultimate source of energy for most ecosystems?',
 'Water', 'Soil', 'Sun', 'Air',
 'C', 'Sunlight is the primary energy source for most ecosystems through photosynthesis');

-- Government Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
((SELECT id FROM subjects WHERE code = 'GOV'), 'Nigerian Government', 'easy',
 'How many states are in Nigeria?',
 '36', '37', '38', '39',
 'A', 'Nigeria has 36 states plus the Federal Capital Territory'),

((SELECT id FROM subjects WHERE code = 'GOV'), 'Nigerian Government', 'medium',
 'Who is the current head of the executive branch in Nigeria?',
 'President', 'Governor', 'Prime Minister', 'Chancellor',
 'A', 'The President is the head of the executive branch in Nigeria');

-- Literature Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
((SELECT id FROM subjects WHERE code = 'LIT'), 'African Literature', 'medium',
 'In "Things Fall Apart", who is the main character?',
 'Okonkwo', 'Obierika', 'Nwoye', 'Ikemefuna',
 'A', 'Okonkwo is the protagonist of Chinua Achebe''s "Things Fall Apart"'),

((SELECT id FROM subjects WHERE code = 'LIT'), 'Literary Terms', 'easy',
 'What is a metaphor?',
 'Direct comparison', 'Indirect comparison', 'Personification', 'Hyperbole',
 'B', 'A metaphor is an indirect comparison without using "like" or "as"');

-- Economics Questions
INSERT INTO questions (subject_id, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
((SELECT id FROM subjects WHERE code = 'ECO'), 'Microeconomics', 'easy',
 'What is scarcity in economics?',
 'Abundance', 'Limited resources', 'Unlimited wants', 'Equal distribution',
 'B', 'Scarcity refers to limited resources relative to unlimited wants'),

((SELECT id FROM subjects WHERE code = 'ECO'), 'Macroeconomics', 'medium',
 'What is GDP?',
 'Gross Domestic Product', 'General Development Plan', 'Global Development Protocol', 'Growth Domestic Price',
 'A', 'GDP stands for Gross Domestic Product');
