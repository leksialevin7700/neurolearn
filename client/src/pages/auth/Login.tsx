import React, { useState } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { Github, Chrome, ArrowRight, Loader2 } from 'lucide-react';

import { supabase } from '@/lib/supabase';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Email login logic would go here
    setTimeout(() => { setIsLoading(false); navigate('/'); }, 1500);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
      try {
          setIsLoading(true);
          const { data, error } = await supabase.auth.signInWithOAuth({
              provider: provider,
              options: {
                  redirectTo: window.location.origin
              }
          });

          if (error) throw error;
          // Supabase handles the redirect automatically
      } catch (error) {
          console.error("Auth Error:", error);
          alert("Login failed! Check console for details (and ensure .env keys are set).");
          setIsLoading(false);
      }
  };

  return (
    <AuthLayout 
        title="Welcome Back" 
        subtitle="Sign in to continue your learning journey"
    >
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Button 
                    variant="outline" 
                    onClick={() => handleSocialLogin('google')}
                    className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <Chrome className="w-5 h-5 mr-2 text-red-500" /> Google
                </Button>
                <Button 
                     variant="outline" 
                     onClick={() => handleSocialLogin('github')}
                     className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <Github className="w-5 h-5 mr-2" /> GitHub
                </Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jayashree@example.com" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" required />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="#" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <Input id="password" type="password" className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" required />
                </div>

                <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Sign up for free
                </Link>
            </div>
        </div>
    </AuthLayout>
  );
};
