-- JAMB CBT Platform - Production Database Schema
-- Complete database structure for a real CBT examination platform

-- Drop existing tables if they exist (for clean rebuild)
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS exam_answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS progress CASCADE;

-- Subjects Table - Core JAMB subjects
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- hex color
  total_questions INTEGER DEFAULT 0,
  exam_duration INTEGER DEFAULT 60, -- minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table - Complete question bank
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles Table - Extended user information
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  exam_number VARCHAR(20),
  target_school VARCHAR(200),
  target_course VARCHAR(200),
  preferred_subjects TEXT[], -- array of subject names
  study_goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Exam Attempts Table - Track exam sessions
CREATE TABLE exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_type VARCHAR(20) NOT NULL CHECK (exam_type IN ('practice', 'mock', 'full')),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score INTEGER,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  time_started TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_completed TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Answers Table - Individual question answers
CREATE TABLE exam_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_answer VARCHAR(1) CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- Test Results Table - Legacy compatibility
CREATE TABLE test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  exam_type VARCHAR(20) DEFAULT 'practice',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Table - Legacy compatibility
CREATE TABLE progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Policies for Subjects (public read, authenticated write)
CREATE POLICY "Public can view subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert subjects" ON subjects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update subjects" ON subjects FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for Questions (public read, authenticated write)
CREATE POLICY "Public can view active questions" ON questions FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can insert questions" ON questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update questions" ON questions FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for User Profiles (users can only manage their own profile)
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies for Exam Attempts (users can only manage their own attempts)
CREATE POLICY "Users can view own exam attempts" ON exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exam attempts" ON exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exam attempts" ON exam_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Policies for Exam Answers (users can only manage their own answers)
CREATE POLICY "Users can view own exam answers" ON exam_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exam answers" ON exam_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exam answers" ON exam_answers FOR UPDATE USING (auth.uid() = user_id);

-- Policies for Test Results (users can only manage their own results)
CREATE POLICY "Users can view own test results" ON test_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test results" ON test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for Progress (users can only manage their own progress)
CREATE POLICY "Users can view own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for Performance
CREATE INDEX idx_questions_subject_id ON questions(subject_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);

CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_subject_id ON exam_attempts(subject_id);
CREATE INDEX idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX idx_exam_attempts_created_at ON exam_attempts(created_at);

CREATE INDEX idx_exam_answers_attempt_id ON exam_answers(attempt_id);
CREATE INDEX idx_exam_answers_question_id ON exam_answers(question_id);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_subject ON test_results(subject);
CREATE INDEX idx_test_results_created_at ON test_results(created_at);

CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate exam score
CREATE OR REPLACE FUNCTION calculate_exam_score(attempt_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_questions INTEGER;
  correct_answers INTEGER;
  score_percentage INTEGER;
BEGIN
  -- Get total questions in this attempt
  SELECT COUNT(*) INTO total_questions
  FROM exam_answers
  WHERE attempt_id = exam_answers.attempt_id;
  
  -- Get correct answers
  SELECT COUNT(*) INTO correct_answers
  FROM exam_answers
  WHERE attempt_id = exam_answers.attempt_id AND is_correct = true;
  
  -- Calculate percentage
  IF total_questions > 0 THEN
    score_percentage := (correct_answers * 100) / total_questions;
  ELSE
    score_percentage := 0;
  END IF;
  
  -- Update the attempt record
  UPDATE exam_attempts
  SET score = score_percentage,
      correct_answers = correct_answers,
      total_questions = total_questions
  WHERE id = attempt_id;
  
  RETURN score_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to get user performance analytics
CREATE OR REPLACE FUNCTION get_user_performance_analytics(user_uuid UUID)
RETURNS TABLE(
  subject_name VARCHAR,
  total_attempts BIGINT,
  average_score NUMERIC,
  best_score INTEGER,
  worst_score INTEGER,
  improvement_trend NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name as subject_name,
    COUNT(ea.id) as total_attempts,
    ROUND(AVG(ea.score), 2) as average_score,
    COALESCE(MAX(ea.score), 0) as best_score,
    COALESCE(MIN(ea.score), 0) as worst_score,
    CASE 
      WHEN COUNT(ea.id) >= 2 THEN 
        ROUND(
          (LAST_VALUE(ea.score) OVER (ORDER BY ea.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) - 
           FIRST_VALUE(ea.score) OVER (ORDER BY ea.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)), 2
        )
      ELSE 0 
    END as improvement_trend
  FROM exam_attempts ea
  JOIN subjects s ON ea.subject_id = s.id
  WHERE ea.user_id = user_uuid AND ea.status = 'completed'
  GROUP BY s.name
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;
