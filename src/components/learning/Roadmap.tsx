import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useAuth } from '@/hooks/useAuth';
import { ROADMAPS, LEARNING_DOMAINS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Lock, CheckCircle2, PlayCircle, Circle, Sparkles } from 'lucide-react';

interface RoadmapProps {
  onModuleClick: (moduleId: string) => void;
}

export function Roadmap({ onModuleClick }: RoadmapProps) {
  const { profile } = useAuth();
  const { progress, isLoading } = useLearningProgress();

  if (!profile?.selected_domain) return null;

  const domain = LEARNING_DOMAINS.find(d => d.id === profile.selected_domain);
  const roadmap = ROADMAPS[profile.selected_domain] || [];

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = progress?.find(p => p.module_id === moduleId);
    return moduleProgress?.status || 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-primary animate-pulse" />;
      case 'available':
        return <Circle className="w-5 h-5 text-primary" />;
      default:
        return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRevisionBadge = (moduleId: string) => {
    const moduleProgress = progress?.find(p => p.module_id === moduleId);
    if (!moduleProgress?.revision_urgency || moduleProgress.status !== 'completed') return null;

    const badges = {
      high: { label: '🔴 Revise now!', className: 'urgency-high' },
      medium: { label: '🟡 Revise soon', className: 'urgency-medium' },
      low: { label: '🟢 Good for now', className: 'urgency-low' },
    };

    const badge = badges[moduleProgress.revision_urgency];
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', badge.className)}>
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">{domain?.icon}</span>
        <div>
          <h2 className="text-2xl font-display font-bold">{domain?.name}</h2>
          <p className="text-muted-foreground text-sm">Your personalized learning path</p>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-secondary opacity-30" />

        {/* Modules */}
        <div className="space-y-4">
          {roadmap.map((module, index) => {
            const status = getModuleStatus(module.id);
            const isClickable = status === 'available' || status === 'in_progress' || status === 'completed';

            return (
              <div
                key={module.id}
                className={cn(
                  'relative flex gap-4 animate-fade-in',
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Status indicator */}
                <div className={cn(
                  'relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                  status === 'completed' && 'bg-success/20',
                  status === 'in_progress' && 'bg-primary/20',
                  status === 'available' && 'bg-primary/10',
                  status === 'locked' && 'bg-muted'
                )}>
                  {getStatusIcon(status)}
                </div>

                {/* Module card */}
                <button
                  onClick={() => isClickable && onModuleClick(module.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex-1 neural-card rounded-xl p-4 text-left transition-all',
                    isClickable && 'cursor-pointer hover:ring-1 hover:ring-primary/50',
                    !isClickable && 'opacity-60 cursor-not-allowed',
                    status === 'completed' && 'module-completed',
                    status === 'available' && 'module-available',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Module {index + 1}</span>
                        {status === 'in_progress' && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Sparkles className="w-3 h-3" />
                            In Progress
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-semibold">{module.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    </div>
                    {getRevisionBadge(module.id)}
                  </div>

                  {/* Score display for completed modules */}
                  {status === 'completed' && progress && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Score: <span className="text-foreground font-medium">
                          {progress.find(p => p.module_id === module.id)?.score}%
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Time: <span className="text-foreground font-medium">
                          {Math.round((progress.find(p => p.module_id === module.id)?.total_time_seconds || 0) / 60)}m
                        </span>
                      </span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
