import React, { useState } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { Github, Chrome, Loader2 } from 'lucide-react';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate Signup
    setTimeout(() => {
        setIsLoading(false);
        navigate('/');
    }, 1500);
  };

  return (
    <AuthLayout 
        title="Create Account" 
        subtitle="Start building your adaptive learning roadmap today"
    >
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Button 
                    variant="outline" 
                    className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <Chrome className="w-5 h-5 mr-2 text-red-500" /> Google
                </Button>
                <Button 
                     variant="outline" 
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
                    <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500">Or register with email</span>
                </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" placeholder="Jayashree" className="bg-white dark:bg-slate-900" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" placeholder="M" className="bg-white dark:bg-slate-900" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jayashree@example.com" className="bg-white dark:bg-slate-900" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="bg-white dark:bg-slate-900" required />
                </div>

                <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Sign in
                </Link>
            </div>
        </div>
    </AuthLayout>
  );
};
