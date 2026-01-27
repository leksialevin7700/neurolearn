import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { DomainSelector } from '@/components/onboarding/DomainSelector';
import { Header } from '@/components/layout/Header';
import { Roadmap } from '@/components/learning/Roadmap';
import { ModuleContent } from '@/components/learning/ModuleContent';
import { DiagnosticQuiz } from '@/components/learning/DiagnosticQuiz';
import { ModuleQuiz } from '@/components/learning/ModuleQuiz';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { ROADMAPS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

type View = 'roadmap' | 'diagnostic' | 'module-content' | 'module-quiz';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const { progress, updateModuleStatus } = useLearningProgress();
  const [activeTab, setActiveTab] = useState<'learn' | 'dashboard'>('learn');
  const [view, setView] = useState<View>('roadmap');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [contentFormat, setContentFormat] = useState<'video' | 'text' | 'mixed'>('mixed');
  const [hasTakenDiagnostic, setHasTakenDiagnostic] = useState(false);

  // Check if user has taken diagnostic quiz
  useEffect(() => {
    if (profile?.preferred_content_format && profile.preferred_content_format !== 'mixed') {
      setHasTakenDiagnostic(true);
      setContentFormat(profile.preferred_content_format as 'video' | 'text' | 'mixed');
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center neural-bg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show auth
  if (!user) {
    return <AuthForm />;
  }

  // Logged in but hasn't selected domain - show onboarding
  if (!profile?.onboarding_completed) {
    return <DomainSelector />;
  }

  const handleModuleClick = (moduleId: string) => {
    setSelectedModuleId(moduleId);

    // Check if this is the first module and diagnostic hasn't been taken
    const roadmap = ROADMAPS[profile.selected_domain || ''];
    const isFirstModule = roadmap?.[0]?.id === moduleId;

    if (isFirstModule && !hasTakenDiagnostic) {
      setView('diagnostic');
    } else {
      // Update module status to in_progress
      const moduleProgress = progress?.find(p => p.module_id === moduleId);
      if (moduleProgress?.status === 'available') {
        updateModuleStatus.mutate({ moduleId, status: 'in_progress' });
      }
      setView('module-content');
    }
  };

  const handleDiagnosticComplete = (format: 'video' | 'text' | 'mixed') => {
    setContentFormat(format);
    setHasTakenDiagnostic(true);

    if (selectedModuleId) {
      updateModuleStatus.mutate({ moduleId: selectedModuleId, status: 'in_progress' });
    }
    setView('module-content');
  };

  const handleQuizComplete = (passed: boolean) => {
    // We don't change the view here anymore because the Quiz component
    // needs to stay mounted to show the "Results" screen with the "Next Quiz" button.
    // The view will transition when the user clicks "Continue" or "Next Quiz".
    console.log('Quiz completed, passed:', passed);
  };

  const handleNextQuiz = () => {
    if (!profile?.selected_domain || !selectedModuleId) return;
    const roadmap = ROADMAPS[profile.selected_domain];
    if (!roadmap) return;
    const currentIndex = roadmap.findIndex(m => m.id === selectedModuleId);
    if (currentIndex >= 0 && currentIndex < roadmap.length - 1) {
      const nextModule = roadmap[currentIndex + 1];
      setSelectedModuleId(nextModule.id);
      // Immediately start the next quiz
      setView('module-quiz');
    }
  };

  const getModuleName = () => {
    if (!selectedModuleId || !profile?.selected_domain) return '';
    const roadmap = ROADMAPS[profile.selected_domain];
    return roadmap?.find(m => m.id === selectedModuleId)?.name || '';
  };

  // Render quiz views (fullscreen)
  if (view === 'diagnostic') {
    return (
      <DiagnosticQuiz
        onComplete={handleDiagnosticComplete}
        onExit={() => {
          setView('roadmap');
          setSelectedModuleId(null);
        }}
      />
    );
  }

  if (view === 'module-quiz' && selectedModuleId) {
    return (
      <ModuleQuiz
        moduleId={selectedModuleId}
        onComplete={handleQuizComplete}
        onExit={() => setView('module-content')}
        onNextQuiz={handleNextQuiz}
      />
    );
  }

  // Main app layout
  return (
    <div className="min-h-screen neural-bg">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'learn' ? (
          view === 'roadmap' ? (
            <Roadmap onModuleClick={handleModuleClick} />
          ) : view === 'module-content' && selectedModuleId ? (
            <ModuleContent
              moduleId={selectedModuleId}
              moduleName={getModuleName()}
              onBack={() => {
                setView('roadmap');
                setSelectedModuleId(null);
              }}
              onStartQuiz={() => setView('module-quiz')}
              contentFormat={contentFormat}
            />
          ) : null
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
