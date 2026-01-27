import React from 'react';
import { Home, Map, BookOpen, BarChart2, Calendar, User, LogOut, Settings, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

import { ModeToggle } from "@/components/mode-toggle";

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navItems = [
    { icon: Home, label: "Home", href: "/", active: true },
    { icon: BookOpen, label: "Friends Progress", href: "/friends", active: false },
    { icon: MessageCircle, label: "Chat", href: "/chat", active: false },
    { icon: BarChart2, label: "Progress", href: "/analytics", active: false },
    { icon: Calendar, label: "Calendar", href: "/calendar", active: false },
    { icon: Settings, label: "Settings", href: "/settings", active: false },
  ];

  return (
    <div className={cn("hidden md:flex flex-col h-screen py-6 pl-4 pr-4 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 md:w-72 sticky top-0", className)}>
      <div className="space-y-6 flex-1">
        {/* Logo Area */}
        <div className="px-4 py-2 flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BookOpen className="text-white h-6 w-6" />
           </div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NeuroLearn</h2>
        </div>

        {/* Navigation */}
        <div className="py-2">
          <div className="space-y-2">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base font-medium h-12 rounded-xl transition-all duration-200", 
                  item.active 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 hover:text-white" 
                    : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", item.active ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Profile Section */}
      <div className="mt-auto px-2 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all cursor-pointer group">
             <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 transition-colors">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
             </div>
             <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Jayashree</p>
                 <p className="text-xs text-slate-400 truncate">Student Account</p>
             </div>
          </div>
          <ModeToggle />
      </div>
    </div>
  );
};
