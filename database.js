// JAMB CBT Platform - Database Layer
// Supabase client and data management

// Initialize Supabase client
class DatabaseService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Check if Supabase is available
      if (typeof supabase === 'undefined') {
        throw new Error('Supabase library not loaded');
      }

      const { createClient } = supabase;
      this.client = createClient(
        window.CONFIG.SUPABASE_CONFIG.url,
        window.CONFIG.SUPABASE_CONFIG.anonKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        }
      );

      this.initialized = true;
      console.log('Database service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  // Authentication Methods
  async signUp(email, password, userData) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createProfile(data.user.id, userData);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error('Get current user error:', error);
      return { success: false, error: error.message };
    }
  }

  // Profile Management
  async createProfile(userId, profileData) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .insert({
          user_id: userId,
          first_name: profileData.firstName || profileData.first_name,
          last_name: profileData.lastName || profileData.last_name,
          phone: profileData.phone || null,
          exam_number: profileData.examNumber || null,
          target_school: profileData.targetSchool || null,
          target_course: profileData.targetCourse || null,
          preferred_subjects: profileData.preferredSubjects || [],
          study_goals: profileData.studyGoals || null,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create profile error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          target_school: profileData.targetSchool,
          target_course: profileData.targetCourse,
          preferred_subjects: profileData.preferredSubjects,
          study_goals: profileData.studyGoals,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }

  async getProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  }

  // Subjects Management
  async getSubjects() {
    try {
      const { data, error } = await this.client
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get subjects error:', error);
      return { success: false, error: error.message };
    }
  }

  // Questions Management
  async getQuestions(subjectId, difficulty = null, limit = null) {
    try {
      let query = this.client
        .from('questions')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('is_active', true);

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      if (limit) {
        query = query.limit(limit);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get questions error:', error);
      return { success: false, error: error.message };
    }
  }

  async getRandomQuestions(subjectIds, count = 60, difficulty = null) {
    try {
      let query = this.client
        .from('questions')
        .select('*')
        .in('subject_id', subjectIds)
        .eq('is_active', true);

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      // Get more questions than needed for randomization
      const { data, error } = await query.limit(Math.min(count * 2, 200));
      if (error) throw error;

      // Randomize and limit to requested count
      const shuffled = data.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      return { success: true, data: selected };
    } catch (error) {
      console.error('Get random questions error:', error);
      return { success: false, error: error.message };
    }
  }

  // Exam Attempts Management
  async createExamAttempt(userId, subjectId, examType, totalQuestions) {
    try {
      const { data, error } = await this.client
        .from('exam_attempts')
        .insert({
          user_id: userId,
          subject_id: subjectId,
          exam_type: examType,
          total_questions: totalQuestions,
          status: 'in_progress',
          time_started: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create exam attempt error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateExamAttempt(attemptId, updates) {
    try {
      const { data, error } = await this.client
        .from('exam_attempts')
        .update(updates)
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update exam attempt error:', error);
      return { success: false, error: error.message };
    }
  }

  async completeExamAttempt(attemptId) {
    try {
      // Calculate score using the database function
      const { data: scoreData, error: scoreError } = await this.client
        .rpc('calculate_exam_score', { attempt_id: attemptId });

      if (scoreError) throw scoreError;

      // Update attempt status
      const { data, error } = await this.client
        .from('exam_attempts')
        .update({
          status: 'completed',
          time_completed: new Date().toISOString(),
          score: scoreData,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Complete exam attempt error:', error);
      return { success: false, error: error.message };
    }
  }

  async getExamAttempts(userId, subjectId = null, limit = 10) {
    try {
      let query = this.client
        .from('exam_attempts')
        .select(`
          *,
          subjects(name, code)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get exam attempts error:', error);
      return { success: false, error: error.message };
    }
  }

  // Exam Answers Management
  async saveExamAnswer(attemptId, questionId, selectedAnswer, isCorrect, timeTaken, isFlagged = false) {
    try {
      const { data, error } = await this.client
        .from('exam_answers')
        .upsert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken,
          is_flagged: isFlagged,
        }, {
          onConflict: 'attempt_id,question_id'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save exam answer error:', error);
      return { success: false, error: error.message };
    }
  }

  async getExamAnswers(attemptId) {
    try {
      const { data, error } = await this.client
        .from('exam_answers')
        .select(`
          *,
          questions(question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
        `)
        .eq('attempt_id', attemptId)
        .order('created_at');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get exam answers error:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics and Performance
  async getUserPerformanceAnalytics(userId) {
    try {
      const { data, error } = await this.client
        .rpc('get_user_performance_analytics', { user_uuid: userId });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get performance analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserStats(userId) {
    try {
      const { data, error } = await this.client
        .from('exam_attempts')
        .select('score, status, created_at, subjects(name)')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const stats = {
        totalAttempts: data.length,
        averageScore: data.length > 0 ? data.reduce((sum, attempt) => sum + attempt.score, 0) / data.length : 0,
        bestScore: data.length > 0 ? Math.max(...data.map(attempt => attempt.score)) : 0,
        recentAttempts: data.slice(0, 5),
        subjectPerformance: {},
      };

      // Calculate subject performance
      data.forEach(attempt => {
        const subject = attempt.subjects?.name || 'Unknown';
        if (!stats.subjectPerformance[subject]) {
          stats.subjectPerformance[subject] = {
            attempts: 0,
            totalScore: 0,
            bestScore: 0,
          };
        }
        stats.subjectPerformance[subject].attempts++;
        stats.subjectPerformance[subject].totalScore += attempt.score;
        stats.subjectPerformance[subject].bestScore = Math.max(
          stats.subjectPerformance[subject].bestScore,
          attempt.score
        );
      });

      // Calculate averages for each subject
      Object.keys(stats.subjectPerformance).forEach(subject => {
        const perf = stats.subjectPerformance[subject];
        perf.averageScore = perf.totalScore / perf.attempts;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Get user stats error:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility Methods
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('subjects')
        .select('count')
        .limit(1);

      if (error) throw error;
      return { success: true, connected: true };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe to real-time changes
  subscribeToTable(tableName, callback) {
    if (!this.client) return null;

    return this.client
      .channel(`table-changes-${tableName}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        callback
      )
      .subscribe();
  }

  // Unsubscribe from channel
  unsubscribe(channel) {
    if (channel) {
      this.client.removeChannel(channel);
    }
  }
}

// Create and export database service instance
const databaseService = new DatabaseService();

// Export for use in other modules
window.Database = databaseService;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (!databaseService.initialized) {
    console.warn('Database service not initialized. Check configuration.');
  }
});
