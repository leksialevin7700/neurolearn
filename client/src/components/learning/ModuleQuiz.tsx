import { Quiz } from './Quiz';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { MODULE_QUESTIONS, DIAGNOSTIC_QUESTIONS, ROADMAPS } from '@/lib/constants';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ModuleQuizProps {
  moduleId: string;
  onComplete: (passed: boolean) => void;
  onExit: () => void;
  onNextQuiz?: () => void;
}

export function ModuleQuiz({ moduleId, onComplete, onExit, onNextQuiz }: ModuleQuizProps) {
  const { saveQuizAnalytics, updateModuleStatus } = useLearningProgress();
  const { profile } = useAuth();

  // Get questions - fallback to diagnostic questions if module-specific not available
  let questions = MODULE_QUESTIONS[moduleId];

  if (!questions && profile?.selected_domain) {
    // Use first 3 diagnostic questions as fallback
    questions = DIAGNOSTIC_QUESTIONS[profile.selected_domain]?.slice(0, 3);
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-fullscreen neural-bg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Quiz questions not available for this module.</p>
          <button onClick={onExit} className="text-primary hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
        module_id: moduleId,
        quiz_type: 'module',
        questions_data: result.questionsData,
        total_score: result.score,
        max_score: result.maxScore,
        total_time_seconds: result.totalTimeSeconds,
        time_per_question: result.timePerQuestion,
        concepts_covered: result.conceptsCovered,
      });

      // Update module status
      const passed = result.score >= 60;

      await updateModuleStatus.mutateAsync({
        moduleId,
        status: passed ? 'completed' : 'in_progress',
        score: result.score,
        timeSeconds: result.totalTimeSeconds,
      });

      if (passed) {
        toast.success('Module completed! Next module unlocked.');
      } else {
        toast.info('Keep practicing! Review the content and try again.');
      }

      onComplete(passed);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error('Failed to save results. Please try again.');
    }
  };

  const hasNextModule = () => {
    if (!profile?.selected_domain || !moduleId) return false;
    const roadmap = ROADMAPS[profile.selected_domain];
    if (!roadmap) return false;
    const currentIndex = roadmap.findIndex(m => m.id === moduleId);
    return currentIndex >= 0 && currentIndex < roadmap.length - 1;
  };

  return (
    <Quiz
      questions={questions}
      quizType="module"
      moduleId={moduleId}
      onComplete={handleComplete}
      onExit={onExit}
      onNextQuiz={onNextQuiz}
      showNextQuiz={hasNextModule()}
    />
  );
}
