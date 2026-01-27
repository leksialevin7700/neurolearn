import React from 'react';
import { Sidebar } from './Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:block shrink-0" />

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden border-b bg-white dark:bg-slate-950 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="font-bold text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs">N</span>
            NeuroLearn
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar className="block border-none w-full" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
           {children}
        </main>
      </div>
    </div>
  );
};
