import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ROADMAPS, calculateRevisionUrgency } from '@/lib/constants';
import type { Json } from '@/integrations/supabase/types';

interface LearningProgress {
  id: string;
  user_id: string;
  domain: string;
  module_id: string;
  module_name: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score: number | null;
  total_time_seconds: number | null;
  attempts: number;
  last_completed_at: string | null;
  revision_urgency: 'high' | 'medium' | 'low' | null;
}

interface QuizAnalytics {
  id: string;
  user_id: string;
  module_id: string;
  quiz_type: 'diagnostic' | 'module';
  questions_data: Json;
  total_score: number;
  max_score: number;
  total_time_seconds: number;
  time_per_question: Json | null;
  concepts_covered: string[];
  completed_at: string;
}

interface QuizInput {
  module_id: string;
  quiz_type: 'diagnostic' | 'module';
  questions_data: Record<string, unknown>;
  total_score: number;
  max_score: number;
  total_time_seconds: number;
  time_per_question: Record<string, number>;
  concepts_covered: string[];
}

export function useLearningProgress() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['learningProgress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as LearningProgress[];
    },
    enabled: !!user,
  });

  const { data: quizAnalytics } = useQuery({
    queryKey: ['quizAnalytics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('quiz_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as QuizAnalytics[];
    },
    enabled: !!user,
  });

  const initializeProgress = useMutation({
    mutationFn: async (domain: string) => {
      if (!user) throw new Error('No user');

      const roadmap = ROADMAPS[domain];
      if (!roadmap) throw new Error('Invalid domain');

      const progressEntries = roadmap.map((module, index) => ({
        user_id: user.id,
        domain,
        module_id: module.id,
        module_name: module.name,
        status: index === 0 ? 'available' : 'locked',
        attempts: 0,
      }));

      const { error } = await supabase
        .from('learning_progress')
        .upsert(progressEntries, { onConflict: 'user_id,module_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningProgress'] });
    },
  });

  const updateModuleStatus = useMutation({
    mutationFn: async ({ moduleId, status, score, timeSeconds }: {
      moduleId: string;
      status: 'in_progress' | 'completed';
      score?: number;
      timeSeconds?: number;
    }) => {
      if (!user) throw new Error('No user');

      const updates: Record<string, unknown> = { status };
      
      if (status === 'completed') {
        updates.score = score;
        updates.total_time_seconds = timeSeconds;
        updates.last_completed_at = new Date().toISOString();
        updates.attempts = (progress?.find(p => p.module_id === moduleId)?.attempts ?? 0) + 1;
        
        // Calculate revision urgency
        const urgency = calculateRevisionUrgency(
          new Date(),
          score ?? 0,
          updates.attempts as number
        );
        updates.revision_urgency = urgency;
      }

      const { error } = await supabase
        .from('learning_progress')
        .update(updates)
        .eq('user_id', user.id)
        .eq('module_id', moduleId);

      if (error) throw error;

      // Unlock next module if completed
      if (status === 'completed' && profile?.selected_domain) {
        const roadmap = ROADMAPS[profile.selected_domain];
        const currentIndex = roadmap.findIndex(m => m.id === moduleId);
        
        if (currentIndex < roadmap.length - 1) {
          const nextModule = roadmap[currentIndex + 1];
          await supabase
            .from('learning_progress')
            .update({ status: 'available' })
            .eq('user_id', user.id)
            .eq('module_id', nextModule.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningProgress'] });
    },
  });

  const saveQuizAnalytics = useMutation({
    mutationFn: async (analytics: QuizInput) => {
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('quiz_analytics')
        .insert([{
          module_id: analytics.module_id,
          quiz_type: analytics.quiz_type,
          questions_data: analytics.questions_data as Json,
          total_score: analytics.total_score,
          max_score: analytics.max_score,
          total_time_seconds: analytics.total_time_seconds,
          time_per_question: analytics.time_per_question as Json,
          concepts_covered: analytics.concepts_covered,
          user_id: user.id,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizAnalytics'] });
    },
  });

  return {
    progress,
    quizAnalytics,
    isLoading,
    initializeProgress,
    updateModuleStatus,
    saveQuizAnalytics,
  };
}
