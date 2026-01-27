import React from 'react';
import { Home, Map, BookOpen, BarChart2, Calendar, User, LogOut, Settings, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const navItems = [
    { icon: Home, label: "Home", href: "/", active: true },
    { icon: BookOpen, label: "Students", href: "/students", active: false },
    { icon: MessageCircle, label: "Chat", href: "/chat", active: false },
    { icon: BarChart2, label: "Progress", href: "/analytics", active: false },
    { icon: Calendar, label: "Calendar", href: "/calendar", active: false },
    { icon: Settings, label: "Settings", href: "/settings", active: false },
  ];

  return (
    <div className={cn("pb-12 min-h-screen bg-slate-50 border-r-0 md:w-72 hidden md:block pl-4 pr-4 pt-6", className)}>
      <div className="space-y-6">
        {/* Logo Area */}
        <div className="px-4 py-2 flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BookOpen className="text-white h-6 w-6" />
           </div>
           <h2 className="text-xl font-bold tracking-tight text-slate-900">NeuroLearn</h2>
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
                    : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
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
      <div className="absolute bottom-6 px-4 w-full left-0">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
             </div>
             <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-slate-800 truncate">Jayashree M.</p>
                 <p className="text-xs text-slate-500 truncate">Free Plan</p>
             </div>
             <Settings className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600" />
          </div>
      </div>
    </div>
  );
};
