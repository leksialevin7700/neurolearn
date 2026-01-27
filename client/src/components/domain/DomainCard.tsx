import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Code2, Smartphone, Megaphone, Terminal, Cpu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DomainProps {
  id: string;
  name: string;
  description: string;
  color?: string; // Tailwind bg class
  iconColor?: string; // Tailwind text class
  price?: string;
  onClick: (id: string) => void;
}

// Helper to map ID to Icon
const getIcon = (id: string) => {
  switch (id) {
    case 'webdev': return Code2;
    case 'appdev': return Smartphone;
    case 'marketing': return Megaphone;
    case 'dsa': return Terminal;
    case 'aiml': return Cpu;
    case 'devops': return Database;
    default: return Code2;
  }
};

export const DomainCard: React.FC<DomainProps> = ({ id, name, description, color = "bg-slate-100", iconColor = "text-slate-600", price = "Free", onClick }) => {
  const Icon = getIcon(id);

  return (
    <Card 
      className="group border-none shadow-sm bg-white dark:bg-slate-900 border dark:border-slate-800 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer"
      onClick={() => onClick(id)}
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
         <div className={`w-32 h-32 rounded-full ${color} blur-3xl`}></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full items-center text-center pt-8 pb-6 px-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
             <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {name}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
            {description}
          </p>

          <div className="mt-auto w-full border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
             <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
             </div>
          </div>
      </div>
    </Card>
  );
};
