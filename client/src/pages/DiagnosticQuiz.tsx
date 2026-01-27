import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Questions Database with Concepts
const QUESTIONS = {
  // --- WEB DEVELOPMENT ---
  diagnostic_webdev: [
    { id: 1, question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyper Transfer Main Logic"], correct: 0, concept: "HTML" },
    { id: 2, question: "Which CSS property changes text color?", options: ["text-style", "color", "font-color"], correct: 1, concept: "CSS" },
    { id: 3, question: "What is the Virtual DOM in React?", options: ["A direct copy of the browser DOM", "A lightweight JavaScript representation of the DOM", "A browser extension"], correct: 1, concept: "React" },
    { id: 4, question: "Which hook is used for side effects?", options: ["useState", "useEffect", "useMemo"], correct: 1, concept: "React" },
    { id: 5, question: "How do you select an element with id 'main' in CSS?", options: [".main", "#main", "main"], correct: 1, concept: "CSS" },
  ],
  module_webdev: [
      { id: 1, question: "Which tag is used for the most important heading?", options: ["<head>", "<h1>", "<header>"], correct: 1, concept: "HTML Semantics" },
      { id: 2, question: "What is the purpose of the <alt> attribute?", options: ["Style images", "Link to another page", "Provide text for screen readers"], correct: 2, concept: "Accessibility" },
      { id: 3, question: "Which element is semantic?", options: ["<div>", "<span>", "<article>"], correct: 2, concept: "HTML Semantics" }
  ],

  // --- DSA ---
  diagnostic_dsa: [
    { id: 1, question: "What is the time complexity of accessing an array element?", options: ["O(1)", "O(n)", "O(log n)"], correct: 0, concept: "Arrays" },
    { id: 2, question: "Which data structure follows LIFO?", options: ["Queue", "Stack", "Tree"], correct: 1, concept: "Stacks" },
    { id: 3, question: "What is a binary search tree?", options: ["A tree with max 2 children per node", "A sorted array", "A linear list"], correct: 0, concept: "Trees" },
    { id: 4, question: "Worst case time complexity of QuickSort?", options: ["O(n log n)", "O(n^2)", "O(n)"], correct: 1, concept: "Sorting" },
    { id: 5, question: "A Queue follows which principle?", options: ["FIFO", "LIFO", "FILO"], correct: 0, concept: "Queues" },
  ],
  module_dsa: [
      { id: 1, question: "In a static array, insertion at the beginning takes?", options: ["O(1)", "O(n)", "O(log n)"], correct: 1, concept: "Array Operations" },
      { id: 2, question: "Accessing index 5 in an array of size 10 takes?", options: ["O(1)", "O(5)", "O(n)"], correct: 0, concept: "Array Access" },
      { id: 3, question: "Which uses less memory overhead?", options: ["Array", "Linked List", "Tree"], correct: 0, concept: "Memory" }
  ],

  default: [
    { id: 1, question: "Select the correct statement.", options: ["Option A", "Option B", "Option C"], correct: 0, concept: "General" },
  ]
};

export const DiagnosticQuiz: React.FC = () => {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access state
  const isFromModule = location.state?.fromModule; // Check if from module
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [intuition, setIntuition] = useState(""); 
  const [hasStarted, setHasStarted] = useState(false);

  // Focus Mode: Listen for exit
  // Focus Mode: Robust Checks
  useEffect(() => {
    if (!hasStarted) return;

    const checkIntegrity = () => {
        // If we are started but NOT in fullscreen, show warning immediately
        if (!document.fullscreenElement) {
            setShowWarning(true);
        }
    };

    // 1. Event Listener for immediate reaction
    const handleFullscreenChange = () => checkIntegrity();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // document.addEventListener("webkitfullscreenchange", handleFullscreenChange); // Safari support if needed
    
    // 2. Interval Polling (Safety Net) - checks every 500ms
    const interval = setInterval(checkIntegrity, 500);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearInterval(interval);
    };
  }, [hasStarted]);

  // Alert removed to rely on the custom Overlay for better UX

  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted]);

  // Calculate question set
  const contextPrefix = isFromModule ? 'module' : 'diagnostic';
  // Use a type assertion or flexible index to avoid TS error
  const questionKey = `${contextPrefix}_${domainId}` as keyof typeof QUESTIONS;
  const questions = QUESTIONS[questionKey] || QUESTIONS.default;

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
        quiz_form: isFromModule ? "Module-quiz" : "Diagnostic-quiz", // Dynamic form type
        quiz_type: "diagnostic",
        total_time: 300 - timeLeft,
        domain: domainId,
        question_time: [10, 15, 20], 
        num_option_changes: [0, 1, 0],
        intuition: intuition // Include captured intuition
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

  const handleNext = () => {
    if (selectedOption === null) return;

    setAnswers(prev => ({ ...prev, [currentQuestion]: selectedOption }));
    if (selectedOption === questions[currentQuestion].correct) setScore(s => s + 1);

    // Reset for next
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIntuition(""); // Clear intuition
    } else {
      finishQuiz(selectedOption);
    }
  };

  const handleStart = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {
        console.error("Fullscreen denied:", e);
      }
      setHasStarted(true);
  };

  if (!hasStarted) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center space-y-8">
            <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
                <Timer className="w-10 h-10" />
            </div>
            
            <div className="space-y-4 max-w-md">
                <h1 className="text-3xl font-bold text-white">Focus Mode Required</h1>
                <p className="text-slate-400 leading-relaxed">
                    This assessment is proctored by our AI Integrity Layer. 
                    The test will run in <b>Full Screen</b>. Exiting full screen or switching tabs will be flagged.
                </p>
            </div>

            <Button 
                size="lg" 
                onClick={handleStart}
                className="px-12 py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-105"
            >
                Start Assessment
            </Button>
        </div>
      );
  }

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
           <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="bg-slate-900 border-2 border-red-500 rounded-2xl p-8 max-w-md text-center shadow-2xl"
               >
                   <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                       <span className="text-4xl">⚠️</span>
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-4">Focus Mode Violated!</h2>
                   <p className="text-slate-300 mb-8 text-lg">
                       No tab switching or exiting full screen allowed during the assessment.
                   </p>
                   <Button 
                     onClick={() => {
                         setShowWarning(false);
                         document.documentElement.requestFullscreen().catch(e => console.error(e));
                     }}
                     className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 transition-all"
                   >
                       Resume Assessment
                   </Button>
               </motion.div>
           </div>
       )}
       {/* Header ... */}
       {/* Progress ... */}

       {/* Main Content */}
       <div className="flex-1 flex items-center justify-center p-4">
           <div className="max-w-2xl w-full space-y-8">
               <div className="space-y-2">
                   <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Question {currentQuestion + 1} of {questions.length}</h3>
                   <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{questions[currentQuestion].question}</h1>
               </div>

               <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => {
                       // Option rendering logic ...
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
                               borderClass = 'border-transparent opacity-50';
                           }
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
                             </div>
                             <span className={`text-lg transition-colors ${textClass}`}>
                                 {option}
                             </span>
                         </div>
                      </Card>
                      );
                  })}
               </div>

               {/* Intuition Input (Visible after selection) */}
               {selectedOption !== null && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="space-y-2"
                   >
                       <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                           Briefly explain why you chose this answer (Intuition):
                       </label>
                       <textarea 
                           className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                           placeholder="I chose this because..."
                           rows={2}
                           value={intuition}
                           onChange={(e) => setIntuition(e.target.value)}
                           autoFocus
                       />
                   </motion.div>
               )}

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
