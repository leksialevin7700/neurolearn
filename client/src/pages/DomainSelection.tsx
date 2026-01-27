import React, { useState } from 'react';
import { DomainCard } from '@/components/domain/DomainCard';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, Bell, Settings } from 'lucide-react';

// Mock data
const DOMAINS = [
  { id: 'webdev', name: 'Web Development', description: '25 Lessons', color: "bg-purple-100", iconColor: "text-purple-600" },
  { id: 'appdev', name: 'App Development', description: '25 Lessons', color: "bg-cyan-100", iconColor: "text-cyan-600" },
  { id: 'marketing', name: 'Social Media Marketing', description: '25 Lessons', color: "bg-orange-100", iconColor: "text-orange-600" },
  { id: 'dsa', name: 'DSA & Algorithms', description: '40 Lessons', color: "bg-blue-100", iconColor: "text-blue-600" },
  { id: 'devops', name: 'DevOps & Docker', description: '15 Lessons', color: "bg-pink-100", iconColor: "text-pink-600" },
  { id: 'aiml', name: 'AI & Machine Learning', description: '50 Lessons', color: "bg-emerald-100", iconColor: "text-emerald-600" },
];

export const DomainSelection: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleDomainClick = (id: string) => {
    setSelectedDomain(id);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Online Course</h1>
            <p className="text-slate-500">Welcome back, Jayashree!</p>
          </div>
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="rounded-full bg-white border-none shadow-sm h-10 w-10 text-slate-400 hover:text-indigo-600">
                 <Search className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full bg-white border-none shadow-sm h-10 w-10 text-slate-400 hover:text-indigo-600">
                 <Bell className="h-5 w-5" />
              </Button>
               <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
               </div>
          </div>
      </div>

      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-lg text-center md:text-left">
             <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-white">Welcome Back, Jayashree!</h2>
                <p className="text-indigo-100 text-lg">You have learned 80% of your current goal. Keep it up!</p>
             </div>
             
             {/* Progress Bar in Banner */}
             <div className="w-full bg-black/20 rounded-full h-3 max-w-sm mx-auto md:mx-0 backdrop-blur-sm">
                <div className="bg-white h-full rounded-full w-[80%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
             </div>

             <Button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Continue Learning
             </Button>
          </div>

          {/* 3D Illustration Placeholder */}
          <div className="hidden md:block w-64 h-64 relative">
             {/* We simulate the 3D guy with a vibrant abstract shape or image if available */}
             {/* For now, using a placeholder that looks cool */}
             <div className="w-full h-full flex items-center justify-center">
                 <div className="text-[100px]">🚀</div>
             </div>
          </div>
        </div>
      </motion.div>


      {/* Course Grid Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-slate-800">New Courses</h3>
            <span className="text-sm font-medium text-slate-400 cursor-pointer hover:text-indigo-600">See All</span>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="visible"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {DOMAINS.map((domain) => (
             <DomainCard 
                key={domain.id}
                id={domain.id}
                name={domain.name}
                description={domain.description}
                color={domain.color}
                iconColor={domain.iconColor}
                onClick={handleDomainClick}
             />
          ))}
        </motion.div>
      </div>

    </div>
  );
};
