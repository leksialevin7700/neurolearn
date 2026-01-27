import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Brain, Sparkles } from 'lucide-react';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back!');
      } else {
        await signUp(email, password, fullName);
        toast.success('Account created! Welcome to NeuroLearn.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center neural-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 neural-glow mb-4">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            NeuroLearn
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            AI-Powered Adaptive Learning
          </p>
        </div>

        {/* Auth Card */}
        <div className="neural-card rounded-2xl p-8 animate-scale-in">
          <h2 className="text-xl font-display font-semibold text-center mb-6">
            {isLogin ? 'Welcome Back' : 'Start Learning'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="bg-muted border-border focus:border-primary"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-muted border-border focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 neural-glow"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-primary font-medium">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>
        </div>

        {/* Features hint */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center animate-fade-in">
          {[
            { label: 'Adaptive', icon: '🧠' },
            { label: 'Memory-Aware', icon: '📚' },
            { label: 'Ethical', icon: '✨' },
          ].map((feature) => (
            <div key={feature.label} className="text-muted-foreground text-sm">
              <span className="text-2xl block mb-1">{feature.icon}</span>
              {feature.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
