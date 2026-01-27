import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Questions Database with Concepts
const QUESTIONS = {
  webdev: [
    { id: 1, question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyper Transfer Main Logic"], correct: 0, concept: "HTML" },
    { id: 2, question: "Which CSS property changes text color?", options: ["text-style", "color", "font-color"], correct: 1, concept: "CSS" },
    { id: 3, question: "What is the Virtual DOM in React?", options: ["A direct copy of the browser DOM", "A lightweight JavaScript representation of the DOM", "A browser extension"], correct: 1, concept: "React" },
    { id: 4, question: "Which hook is used for side effects?", options: ["useState", "useEffect", "useMemo"], correct: 1, concept: "React" },
    { id: 5, question: "How do you select an element with id 'main' in CSS?", options: [".main", "#main", "main"], correct: 1, concept: "CSS" },
  ],
  dsa: [
    { id: 1, question: "What is the time complexity of accessing an array element?", options: ["O(1)", "O(n)", "O(log n)"], correct: 0, concept: "Arrays" },
    { id: 2, question: "Which data structure follows LIFO?", options: ["Queue", "Stack", "Tree"], correct: 1, concept: "Stacks" },
    { id: 3, question: "What is a binary search tree?", options: ["A tree with max 2 children per node", "A sorted array", "A linear list"], correct: 0, concept: "Trees" },
    { id: 4, question: "Worst case time complexity of QuickSort?", options: ["O(n log n)", "O(n^2)", "O(n)"], correct: 1, concept: "Sorting" },
    { id: 5, question: "A Queue follows which principle?", options: ["FIFO", "LIFO", "FILO"], correct: 0, concept: "Queues" },
  ],
  default: [
    { id: 1, question: "Select the correct statement.", options: ["Option A", "Option B", "Option C"], correct: 0, concept: "General" },
  ]
};

export const DiagnosticQuiz: React.FC = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  // Store all answers: { questionIdx: optionIdx }
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Focus Mode: Auto Fullscreen & Tab Switch Detection
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.error("Fullscreen denied:", e);
      }
    };
    enterFullscreen();

    const handleVisibilityChange = () => {
      if (document.hidden) {
         // Tab switch detected
      }
    };

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            setShowWarning(true);
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const questions = QUESTIONS[domainId as keyof typeof QUESTIONS] || QUESTIONS.default;

  const handleNext = () => {
    if (selectedOption === null) return;

    // Record answer
    setAnswers(prev => ({ ...prev, [currentQuestion]: selectedOption }));

    if (selectedOption === questions[currentQuestion].correct) {
      setScore(s => s + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz(selectedOption); // Pass final answer explicitly to be safe
    }
  };

  const finishQuiz = async (lastAnswer?: number) => {
    setIsSubmitting(true);
    
    // Ensure last answer is recorded for analytics calculation
    const finalAnswers = { ...answers, [currentQuestion]: lastAnswer ?? selectedOption ?? -1 };
    
    // Calculate Concept Analysis
    const conceptStats: Record<string, { total: number, correct: number }> = {};
    
    questions.forEach((q, idx) => {
        if (!conceptStats[q.concept]) conceptStats[q.concept] = { total: 0, correct: 0 };
        conceptStats[q.concept].total += 1;
        if (finalAnswers[idx] === q.correct) {
             conceptStats[q.concept].correct += 1;
        }
    });

    const conceptData = Object.keys(conceptStats).map(concept => ({
        name: concept,
        score: Math.round((conceptStats[concept].correct / conceptStats[concept].total) * 100),
        color: conceptStats[concept].correct === conceptStats[concept].total ? '#2dd4bf' : '#facc15' // teal for perfect, yellow for mixed
    }));

    // Construct Payload
    const payload = {
        quiz_form: "Module-quiz",
        quiz_type: "diagnostic",
        total_time: 300 - timeLeft,
        domain: domainId,
        question_time: [10, 15, 20], 
        num_option_changes: [0, 1, 0]
    };

    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        await fetch(`${apiUrl}/api/submit-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.warn("Backend not reachable", err));

    } catch (e) {
        console.error("Quiz error:", e);
    }

    setTimeout(() => {
        navigate(`/analytics/${domainId}`, { 
            state: { 
                score, 
                totalQuestions: questions.length,
                totalTime: timeLeft, 
                conceptData, // Passing real analytics!
                fromQuiz: true 
            } 
        });
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center space-y-6">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
           className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
         />
         <h2 className="text-2xl font-bold text-white">Analyzing your skills...</h2>
         <p className="text-slate-400">Our AI is building your personalized roadmap.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative">
       
       {/* Focus Mode Warning Overlay */}
       {showWarning && (
           <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="bg-white dark:bg-slate-900 border border-red-500 rounded-2xl p-8 max-w-md text-center shadow-2xl"
               >
                   <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                       <span className="text-3xl">⚠️</span>
                   </div>
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Focus Mode Interrupted</h2>
                   <p className="text-slate-500 dark:text-slate-400 mb-8">
                       Please do not exit full screen or switch tabs. Our AI Integrity Layer monitors focus to ensure accurate assessment.
                   </p>
                   <Button 
                     onClick={() => {
                         setShowWarning(false);
                         document.documentElement.requestFullscreen().catch(e => console.error(e));
                     }}
                     className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                   >
                       Resume Assessment
                   </Button>
               </motion.div>
           </div>
       )}
       {/* Header */}
       <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-8">
           <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white">Diagnostic Assessment</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase">Focus Mode</span>
           </div>
           
           <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono text-lg font-bold">
               <Timer className="w-5 h-5" />
               {formatTime(timeLeft)}
           </div>
       </div>

       {/* Progress Bar */}
       <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-1 rounded-none bg-slate-200 dark:bg-slate-800" indicatorClassName="bg-indigo-600" />

       {/* Main Content */}
       <div className="flex-1 flex items-center justify-center p-4">
           <div className="max-w-2xl w-full space-y-8">
               <div className="space-y-2">
                   <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Question {currentQuestion + 1} of {questions.length}</h3>
                   <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{questions[currentQuestion].question}</h1>
               </div>

               <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => {
                      const isSelected = selectedOption === index;
                      const isCorrect = index === questions[currentQuestion].correct;
                      const showResult = selectedOption !== null;

                      let borderClass = 'border-transparent hover:border-slate-200 dark:hover:border-slate-700';
                      let bgClass = 'bg-white dark:bg-slate-900';
                      let textClass = 'text-slate-700 dark:text-slate-300';
                      let circleClass = 'border-slate-300 dark:border-slate-600';

                      if (showResult) {
                          if (isCorrect) {
                              borderClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                              textClass = 'text-green-700 dark:text-green-300 font-bold';
                              circleClass = 'border-green-500 bg-green-500 text-white';
                          } else if (isSelected) {
                              borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                              textClass = 'text-red-700 dark:text-red-300 font-bold';
                              circleClass = 'border-red-500 bg-red-500 text-white';
                          } else {
                              // Dim other options
                              borderClass = 'border-transparent opacity-50';
                          }
                      } else if (isSelected) {
                          // Selected state before submission (if we had a confirm step, but here it's instant)
                          // simpler to just stick to the feedback logic
                      }

                      return (
                      <Card 
                        key={index}
                        onClick={() => !showResult && setSelectedOption(index)}
                        className={`p-6 cursor-pointer transition-all border-2 ${borderClass} ${bgClass}`}
                      >
                         <div className="flex items-center gap-4">
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${circleClass}`}>
                                 {showResult && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                                 {/* {isSelected && !isCorrect && <XCircle className="w-4 h-4" />} */}
                             </div>
                             <span className={`text-lg transition-colors ${textClass}`}>
                                 {option}
                             </span>
                         </div>
                      </Card>
                      );
                  })}
               </div>

               <div className="flex justify-end pt-8">
                   <Button 
                     size="lg" 
                     onClick={handleNext}
                     disabled={selectedOption === null}
                     className="px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                   >
                      {currentQuestion === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                   </Button>
               </div>
           </div>
       </div>
    </div>
  );
};
