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
      className="group border-none shadow-sm bg-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer"
      onClick={() => onClick(id)}
    >
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
         
         {/* Icon Bubble */}
         <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
         </div>

         {/* Text Content */}
         <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">{name}</h3>
            <p className="text-sm font-medium text-slate-400">{description}</p>
         </div>

         {/* Footer Row */}
         <div className="w-full pt-4 flex items-center justify-end border-t border-slate-50 mt-4">
            <Button size="icon" className="rounded-full w-8 h-8 bg-slate-900 text-white hover:bg-indigo-600 transition-colors">
               <ArrowRight className="w-4 h-4" />
            </Button>
         </div>

      </CardContent>
    </Card>
  );
};
