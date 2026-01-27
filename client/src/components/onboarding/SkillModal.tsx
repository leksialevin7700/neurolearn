import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainName: string;
  onSelectLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

export const SkillModal: React.FC<SkillModalProps> = ({ isOpen, onClose, domainName, onSelectLevel }) => {
  const levels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'I am new to this. Start from scratch.',
      icon: BookOpen,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'I know the basics. Test my knowledge.',
      icon: Brain,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'I am experienced. Challenge me.',
      icon: GraduationCap,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center dark:text-white">How much do you know?</DialogTitle>
          <DialogDescription className="text-center text-slate-500 dark:text-slate-400">
            We will adapt the <strong>{domainName}</strong> roadmap to your current skill level.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex items-center justify-start gap-4 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 border-2 transition-all group"
                onClick={() => onSelectLevel(level.id)}
              >
                <div className={`w-12 h-12 rounded-xl ${level.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <level.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{level.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{level.description}</p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
