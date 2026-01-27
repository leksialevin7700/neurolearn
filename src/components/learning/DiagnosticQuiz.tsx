import { Quiz } from './Quiz';
import { useAuth } from '@/hooks/useAuth';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { DIAGNOSTIC_QUESTIONS, getRecommendedFormat } from '@/lib/constants';
import { toast } from 'sonner';

interface DiagnosticQuizProps {
  onComplete: (format: 'video' | 'text' | 'mixed') => void;
  onExit: () => void;
}

export function DiagnosticQuiz({ onComplete, onExit }: DiagnosticQuizProps) {
  const { profile, updateProfile } = useAuth();
  const { saveQuizAnalytics } = useLearningProgress();

  if (!profile?.selected_domain) return null;

  const questions = DIAGNOSTIC_QUESTIONS[profile.selected_domain] || [];

  const handleComplete = async (result: {
    score: number;
    maxScore: number;
    totalTimeSeconds: number;
    timePerQuestion: Record<string, number>;
    conceptsCovered: string[];
    questionsData: Record<string, unknown>;
  }) => {
    try {
      // Save analytics
      await saveQuizAnalytics.mutateAsync({
        module_id: 'diagnostic',
        quiz_type: 'diagnostic',
        questions_data: result.questionsData,
        total_score: result.score,
        max_score: result.maxScore,
        total_time_seconds: result.totalTimeSeconds,
        time_per_question: result.timePerQuestion,
        concepts_covered: result.conceptsCovered,
      });

      // Calculate recommended format based on analytics
      const avgTimePerQuestion = result.totalTimeSeconds / questions.length;
      const recommendedFormat = getRecommendedFormat(result.score, avgTimePerQuestion);

      // Update profile with preferred format
      await updateProfile({
        preferred_content_format: recommendedFormat,
      });

      toast.success(`AI recommends ${recommendedFormat} learning for you!`);
      onComplete(recommendedFormat);
    } catch (error) {
      console.error('Error saving diagnostic results:', error);
      toast.error('Failed to save results. Please try again.');
    }
  };

  return (
    <Quiz
      questions={questions}
      quizType="diagnostic"
      moduleId="diagnostic"
      onComplete={handleComplete}
      onExit={onExit}
    />
  );
}
