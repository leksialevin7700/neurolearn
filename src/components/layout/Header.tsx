import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Brain, User, LogOut, LayoutDashboard, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeTab: 'learn' | 'dashboard';
  onTabChange: (tab: 'learn' | 'dashboard') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center neural-glow">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">
            NeuroLearn
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('learn')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'learn'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <BookOpen className="w-4 h-4" />
            Learn
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
        </nav>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
