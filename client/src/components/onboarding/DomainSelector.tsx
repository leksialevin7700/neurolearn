import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LEARNING_DOMAINS } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DomainSelector() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();
  const { initializeProgress } = useLearningProgress();

  const handleContinue = async () => {
    if (!selectedDomain) return;

    setLoading(true);
    try {
      // Initialize learning progress for selected domain
      await initializeProgress.mutateAsync(selectedDomain);
      
      // Update profile with selected domain
      await updateProfile({
        selected_domain: selectedDomain,
        onboarding_completed: true,
      });

      toast.success('Great choice! Your learning path is ready.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center neural-bg p-4">
      <div className="w-full max-w-2xl">
        {/* AI Greeting */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Onboarding</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            What do you want to{' '}
            <span className="gradient-text">learn today?</span>
          </h1>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            I'll create a personalized learning path based on your choice and adapt 
            to your unique learning style.
          </p>
        </div>

        {/* Domain Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {LEARNING_DOMAINS.map((domain, index) => (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={cn(
                'neural-card rounded-2xl p-6 text-left transition-all duration-300 animate-fade-in',
                'hover:scale-[1.02]',
                selectedDomain === domain.id && 'ring-2 ring-primary neural-glow'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-4xl mb-4 block">{domain.icon}</span>
              <h3 className="font-display font-semibold text-lg mb-2">
                {domain.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {domain.description}
              </p>
              
              {selectedDomain === domain.id && (
                <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Button
            onClick={handleContinue}
            disabled={!selectedDomain || loading}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 neural-glow px-8"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Start Learning Journey
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
          {['Personalized Path', 'Smart Quizzes', 'Memory Tracking', 'AI Recommendations'].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
