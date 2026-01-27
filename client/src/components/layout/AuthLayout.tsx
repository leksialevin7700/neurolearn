import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950">
      
      {/* Left Side - Neural Animation/Brand */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-950"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-12 text-white max-w-lg">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
               <h1 className="text-5xl font-bold font-grotesk mb-6 leading-tight">
                   Unlock your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Neural Potential</span>
               </h1>
               <p className="text-lg text-slate-400 leading-relaxed">
                   NeuroLearn uses advanced adaptive AI to map your knowledge gaps and build the perfect learning path just for you.
               </p>
           </motion.div>
        
           {/* Decorative Grid */}
           <div className="absolute bottom-0 left-0 w-full h-32 bg-grid-white/[0.05] [mask-image:linear-gradient(to_top,white,transparent)]"></div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          {/* Subtle bg for mobile */}
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 lg:hidden z-0"></div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full max-w-md relative z-10"
          >
              <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
                      <span className="text-2xl">🧠</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>

              {children}
          </motion.div>
      </div>
    </div>
  );
};
