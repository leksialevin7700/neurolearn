import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useAuth } from '@/hooks/useAuth';
import { LEARNING_DOMAINS, ROADMAPS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { 
  Brain, Target, Clock, TrendingUp, Award, 
  BarChart3, Zap, Calendar
} from 'lucide-react';

export function Dashboard() {
  const { profile } = useAuth();
  const { progress, quizAnalytics } = useLearningProgress();

  if (!profile?.selected_domain) return null;

  const domain = LEARNING_DOMAINS.find(d => d.id === profile.selected_domain);
  const roadmap = ROADMAPS[profile.selected_domain] || [];

  // Calculate statistics
  const completedModules = progress?.filter(p => p.status === 'completed').length || 0;
  const totalModules = roadmap.length;
  const completionRate = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const averageScore = progress?.filter(p => p.score !== null).length
    ? Math.round(
        (progress.filter(p => p.score !== null).reduce((acc, p) => acc + (p.score || 0), 0)) /
        progress.filter(p => p.score !== null).length
      )
    : 0;

  const totalTimeMinutes = Math.round(
    (progress?.reduce((acc, p) => acc + (p.total_time_seconds || 0), 0) || 0) / 60
  );

  // Get strong and weak concepts from quiz analytics
  const conceptPerformance = new Map<string, { correct: number; total: number }>();
  
  quizAnalytics?.forEach(qa => {
    qa.concepts_covered?.forEach(concept => {
      const current = conceptPerformance.get(concept) || { correct: 0, total: 0 };
      // This is simplified - in production we'd parse questions_data properly
      current.total += 1;
      if ((qa.total_score / qa.max_score) >= 0.7) {
        current.correct += 1;
      }
      conceptPerformance.set(concept, current);
    });
  });

  const concepts = Array.from(conceptPerformance.entries())
    .map(([name, data]) => ({
      name,
      score: Math.round((data.correct / data.total) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  const strongConcepts = concepts.slice(0, 3);
  const weakConcepts = concepts.slice(-3).reverse();

  // Revision recommendations
  const needsRevision = progress?.filter(p => 
    p.status === 'completed' && p.revision_urgency === 'high'
  ) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Progress"
          value={`${completionRate}%`}
          sublabel={`${completedModules}/${totalModules} modules`}
          color="primary"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="Avg Score"
          value={`${averageScore}%`}
          sublabel="across quizzes"
          color="secondary"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Time Spent"
          value={`${totalTimeMinutes}m`}
          sublabel="total learning"
          color="accent"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Quizzes"
          value={String(quizAnalytics?.length || 0)}
          sublabel="completed"
          color="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Module Progress */}
        <div className="neural-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Module Progress</h3>
              <p className="text-sm text-muted-foreground">{domain?.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            {roadmap.map((module, index) => {
              const moduleProgress = progress?.find(p => p.module_id === module.id);
              const status = moduleProgress?.status || 'locked';
              const score = moduleProgress?.score;

              return (
                <div key={module.id} className="flex items-center gap-4">
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium',
                    status === 'completed' && 'bg-success/20 text-success',
                    status === 'in_progress' && 'bg-primary/20 text-primary',
                    status === 'available' && 'bg-muted text-muted-foreground',
                    status === 'locked' && 'bg-muted/50 text-muted-foreground/50'
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm',
                        status === 'locked' && 'text-muted-foreground/50'
                      )}>
                        {module.name}
                      </span>
                      {score !== null && score !== undefined && (
                        <span className={cn(
                          'text-sm font-medium',
                          score >= 70 ? 'text-success' : 'text-warning'
                        )}>
                          {score}%
                        </span>
                      )}
                    </div>
                    {status === 'completed' && (
                      <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all"
                          style={{ width: `${score || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Concepts Analysis */}
        <div className="neural-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Concept Analysis</h3>
              <p className="text-sm text-muted-foreground">Your strengths & areas to improve</p>
            </div>
          </div>

          {concepts.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Strong Areas
                </h4>
                <div className="space-y-2">
                  {strongConcepts.map(c => (
                    <ConceptBar key={c.name} name={c.name} score={c.score} variant="success" />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-warning mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Needs Practice
                </h4>
                <div className="space-y-2">
                  {weakConcepts.map(c => (
                    <ConceptBar key={c.name} name={c.name} score={c.score} variant="warning" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Complete quizzes to see your concept analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Revision Recommendations */}
      {needsRevision.length > 0 && (
        <div className="neural-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Revision Needed</h3>
              <p className="text-sm text-muted-foreground">Based on forgetting curve analysis</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {needsRevision.map(module => (
              <div 
                key={module.id}
                className="p-4 rounded-xl bg-destructive/5 border border-destructive/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{module.module_name}</span>
                  <span className="urgency-high text-xs px-2 py-0.5 rounded-full">
                    Urgent
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last reviewed {module.last_completed_at 
                    ? new Date(module.last_completed_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  sublabel, 
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  color: 'primary' | 'secondary' | 'accent' | 'success';
}) {
  const colors = {
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-secondary/20 text-secondary',
    accent: 'bg-accent/20 text-accent',
    success: 'bg-success/20 text-success',
  };

  return (
    <div className="neural-card rounded-xl p-4">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colors[color])}>
        {icon}
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xs text-muted-foreground/70 mt-1">{sublabel}</div>
    </div>
  );
}

function ConceptBar({ 
  name, 
  score, 
  variant 
}: { 
  name: string;
  score: number;
  variant: 'success' | 'warning';
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm flex-1 truncate">{name}</span>
      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all',
            variant === 'success' ? 'bg-success' : 'bg-warning'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn(
        'text-sm font-medium w-12 text-right',
        variant === 'success' ? 'text-success' : 'text-warning'
      )}>
        {score}%
      </span>
    </div>
  );
}
