import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Questions Database
const QUESTIONS = {
  webdev: [
    { id: 1, question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyper Transfer Main Logic"], correct: 0 },
    { id: 2, question: "Which CSS property changes text color?", options: ["text-style", "color", "font-color"], correct: 1 },
    { id: 3, question: "What is the Virtual DOM in React?", options: ["A direct copy of the browser DOM", "A lightweight JavaScript representation of the DOM", "A browser extension"], correct: 1 },
  ],
  dsa: [
    { id: 1, question: "What is the time complexity of accessing an array element?", options: ["O(1)", "O(n)", "O(log n)"], correct: 0 },
    { id: 2, question: "Which data structure follows LIFO?", options: ["Queue", "Stack", "Tree"], correct: 1 },
    { id: 3, question: "What is a binary search tree?", options: ["A tree with max 2 children per node", "A sorted array", "A linear list"], correct: 0 },
  ],
  // Fallback for others
  default: [
    { id: 1, question: "Select the correct statement.", options: ["Option A", "Option B", "Option C"], correct: 0 },
    { id: 2, question: "Select the best answer.", options: ["Answer X", "Answer Y", "Answer Z"], correct: 1 },
  ]
};

export const DiagnosticQuiz: React.FC = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = QUESTIONS[domainId as keyof typeof QUESTIONS] || QUESTIONS.default;

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
        alert("⚠️ Warning: Tab switching detected! Focus mode is active.");
        // In a real app, you might log this incident or penalize.
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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

  const handleNext = () => {
    if (selectedOption === null) return;

    if (selectedOption === questions[currentQuestion].correct) {
      setScore(s => s + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsSubmitting(true);
    // Simulate AI Analysis delay
    setTimeout(() => {
        // Navigate to roadmap with results (mocked)
        navigate(`/roadmap/${domainId}`, { state: { fromQuiz: true, score } });
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
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
                  {questions[currentQuestion].options.map((option, index) => (
                      <Card 
                        key={index}
                        onClick={() => setSelectedOption(index)}
                        className={`p-6 cursor-pointer transition-all border-2 ${
                            selectedOption === index 
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                            : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                 selectedOption === index ? 'border-indigo-600' : 'border-slate-300 dark:border-slate-600'
                             }`}>
                                 {selectedOption === index && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                             </div>
                             <span className={`text-lg ${selectedOption === index ? 'text-indigo-900 dark:text-indigo-100 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                 {option}
                             </span>
                         </div>
                      </Card>
                  ))}
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
