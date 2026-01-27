import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, CheckCircle2, XCircle, ArrowRight, Brain } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  concept: string;
}

interface QuizProps {
  questions: Question[];
  quizType: 'diagnostic' | 'module';
  moduleId: string;
  onComplete: (result: {
    score: number;
    maxScore: number;
    totalTimeSeconds: number;
    timePerQuestion: Record<string, number>;
    conceptsCovered: string[];
    questionsData: Record<string, unknown>;
  }) => void;
  onExit: () => void;
  onNextQuiz?: () => void;
  showNextQuiz?: boolean;
}

export function Quiz({ questions, quizType, moduleId, onComplete, onExit, onNextQuiz, showNextQuiz }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, { selected: number; correct: boolean; timeSpent: number }>>({});
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizStartTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer display
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - quizStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = useCallback((index: number) => {
    if (showFeedback) return;

    setSelectedAnswer(index);
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = index === currentQuestion.correctIndex;

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selected: index,
        correct: isCorrect,
        timeSpent,
      }
    }));

    setShowFeedback(true);
  }, [showFeedback, questionStartTime, currentQuestion]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuestionStartTime(Date.now());
    } else {
      // Quiz complete
      const totalTimeSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
      const correctAnswers = Object.values(answers).filter(a => a.correct).length;
      const score = Math.round((correctAnswers / questions.length) * 100);

      const timePerQuestion: Record<string, number> = {};
      const questionsData: Record<string, unknown> = {};

      Object.entries(answers).forEach(([id, data]) => {
        timePerQuestion[id] = data.timeSpent;
        questionsData[id] = {
          selected: data.selected,
          correct: data.correct,
          timeSpent: data.timeSpent,
        };
      });

      const conceptsCovered = [...new Set(questions.map(q => q.concept))];

      onComplete({
        score,
        maxScore: 100,
        totalTimeSeconds,
        timePerQuestion,
        conceptsCovered,
        questionsData,
      });

      setShowResult(true);
    }
  };

  if (showResult) {
    const correctCount = Object.values(answers).filter(a => a.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const avgTimePerQuestion = Math.round(elapsedTime / questions.length);

    return (
      <div className="quiz-fullscreen neural-bg flex items-center justify-center p-4">
        <div className="max-w-lg w-full neural-card rounded-2xl p-8 text-center animate-scale-in">
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
            score >= 70 ? 'bg-success/20' : 'bg-secondary/20'
          )}>
            {score >= 70 ? (
              <CheckCircle2 className="w-10 h-10 text-success" />
            ) : (
              <Brain className="w-10 h-10 text-secondary" />
            )}
          </div>

          <h2 className="text-2xl font-display font-bold mb-2">
            {quizType === 'diagnostic' ? 'Assessment Complete!' : 'Quiz Complete!'}
          </h2>

          <p className="text-muted-foreground mb-6">
            {score >= 70
              ? "Great job! You're ready to continue."
              : "Keep practicing! Review the content and try again."}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="neural-card rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-primary">{score}%</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="neural-card rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-secondary">{formatTime(elapsedTime)}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
            <div className="neural-card rounded-xl p-4">
              <div className="text-2xl font-display font-bold text-accent">{avgTimePerQuestion}s</div>
              <div className="text-xs text-muted-foreground">Avg/Question</div>
            </div>
          </div>

          {/* Question breakdown */}
          <div className="flex justify-center gap-2 mb-8">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium',
                  answers[q.id]?.correct
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {showNextQuiz && onNextQuiz ? (
            <div className="flex gap-3">
              <Button
                onClick={onExit}
                variant="outline"
                className="flex-1"
              >
                Continue
              </Button>
              <Button
                onClick={onNextQuiz}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onExit}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-fullscreen neural-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        <button
          onClick={onExit}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Exit Quiz
        </button>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center">
        <div className="max-w-2xl w-full py-8 animate-fade-in" key={currentQuestion.id}>
          {/* Concept tag */}
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">
              {currentQuestion.concept}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-2xl font-display font-bold text-center mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrectness = showFeedback;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all flex items-center gap-4',
                    'border-2',
                    !showFeedback && 'hover:border-primary/50 hover:bg-primary/5',
                    !showFeedback && !isSelected && 'border-border bg-card',
                    !showFeedback && isSelected && 'border-primary bg-primary/10',
                    showFeedback && isCorrect && 'border-success bg-success/10',
                    showFeedback && isSelected && !isCorrect && 'border-destructive bg-destructive/10',
                    showFeedback && !isSelected && !isCorrect && 'border-border bg-card opacity-50'
                  )}
                >
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0',
                    !showFeedback && 'bg-muted',
                    showFeedback && isCorrect && 'bg-success text-success-foreground',
                    showFeedback && isSelected && !isCorrect && 'bg-destructive text-destructive-foreground'
                  )}>
                    {showCorrectness && isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : showCorrectness && isSelected && !isCorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          {showFeedback && (
            <div className={cn(
              'mt-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in',
              selectedAnswer === currentQuestion.correctIndex
                ? 'bg-success/10 border border-success/20'
                : 'bg-destructive/10 border border-destructive/20'
            )}>
              {selectedAnswer === currentQuestion.correctIndex ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {selectedAnswer === currentQuestion.correctIndex ? 'Correct!' : 'Not quite right'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedAnswer === currentQuestion.correctIndex
                    ? 'Great job! Keep up the good work.'
                    : `The correct answer is: ${currentQuestion.options[currentQuestion.correctIndex]}`}
                </p>
              </div>
            </div>
          )}

          {/* Next button */}
          {showFeedback && (
            <div className="mt-6 flex justify-center animate-fade-in">
              <Button
                onClick={handleNext}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
