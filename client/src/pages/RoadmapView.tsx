import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, PlayCircle, CheckCircle, Brain, Book } from 'lucide-react';
import { motion } from 'framer-motion';

const ROADMAP_DATA = {
   webdev: [
      { id: 1, title: "HTML5 & Semantic Structure", status: "completed", type: "video", duration: "10m" },
      { id: 2, title: "CSS Fundamentals & Flexbox", status: "current", type: "video", duration: "45m" },
      { id: 3, title: "JavaScript Basics (ES6+)", status: "locked", type: "text", duration: "1h 20m" },
      { id: 4, title: "React Components & Props", status: "locked", type: "mixed", duration: "55m" },
      { id: 5, title: "State Management with Hooks", status: "locked", type: "video", duration: "40m" },
   ],
   dsa: [
      { id: 1, title: "Introduction to Complexity", status: "completed", type: "text", duration: "20m" },
      { id: 2, title: "Arrays & Strings", status: "current", type: "video", duration: "1h" },
      { id: 3, title: "Linked Lists", status: "locked", type: "video", duration: "50m" },
      { id: 4, title: "Stacks & Queues", status: "locked", type: "mixed", duration: "45m" },
   ],
   default: [
      { id: 1, title: "Module 1: Foundations", status: "current", type: "video", duration: "30m" },
      { id: 2, title: "Module 2: Core Concepts", status: "locked", type: "text", duration: "45m" },
      { id: 3, title: "Module 3: Advanced Topics", status: "locked", type: "mixed", duration: "1h" },
   ]
};

export const RoadmapView: React.FC = () => {
   const { domainId } = useParams();
   const location = useLocation();
   const navigate = useNavigate();
   const isFromQuiz = location.state?.fromQuiz;

   const modules = ROADMAP_DATA[domainId as keyof typeof ROADMAP_DATA] || ROADMAP_DATA.default;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
         {/* Header */}
         <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Personalized Path</span>
               {isFromQuiz && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Adapted to your Skill Level</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white capitalize mb-4">
               {domainId === 'dsa' ? 'Data Structures & Algorithms' : domainId} Roadmap
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
               Our AI has designed this learning path to optimize for memory retention. We've mixed video and text content based on your learning profile.
            </p>
         </div>

         {/* Timeline */}
         <div className="max-w-3xl mx-auto relative">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-8 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

            <div className="space-y-8 relative">
               {modules.map((module, index) => {
                  const isLocked = module.status === 'locked';
                  const isCompleted = module.status === 'completed';
                  const isCurrent = module.status === 'current';

                  return (
                     <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-6 md:gap-8 group ${isLocked ? 'opacity-60 grayscale' : ''}`}
                     >
                        {/* Icon Node */}
                        <div className={`relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 border-4 transition-all ${isCompleted ? 'bg-green-100 border-green-500 text-green-600' :
                           isCurrent ? 'bg-indigo-600 border-indigo-200 shadow-xl shadow-indigo-500/30 text-white scale-110' :
                              'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                           }`}>
                           {isCompleted ? <CheckCircle className="w-6 h-6" /> :
                              isLocked ? <Lock className="w-5 h-5" /> :
                                 <PlayCircle className="w-6 h-6" />}
                        </div>

                        {/* Content Card */}
                        <div className={`flex-1 p-6 rounded-3xl border transition-all ${isCurrent ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 shadow-lg' :
                           'bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                           }`}>
                           <div className="flex justify-between items-start mb-2">
                              <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                                 }`}>
                                 Module 0{module.id} • {module.type}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">{module.duration}</span>
                           </div>

                           <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-4">
                              {module.title}
                           </h3>

                           {isCurrent && (
                              <Button onClick={() => navigate(`/learn/${domainId}/${module.id}`)} className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700 text-white">
                                 Start Module
                              </Button>
                           )}
                           {isLocked && (
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                 <Lock className="w-3 h-3" />
                                 <span>Complete previous module to unlock</span>
                              </div>
                           )}
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </div>
   );
};
