import { useState } from 'react';
import { MODULE_CONTENT } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, FileText, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleContentProps {
  moduleId: string;
  moduleName: string;
  onBack: () => void;
  onStartQuiz: () => void;
  contentFormat: 'video' | 'text' | 'mixed';
}

export function ModuleContent({ moduleId, moduleName, onBack, onStartQuiz, contentFormat }: ModuleContentProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'tldr'>('tldr');
  const content = MODULE_CONTENT[moduleId];

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Content not available for this module yet.</p>
        <Button onClick={onBack} variant="ghost" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roadmap
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roadmap
        </button>
        
        <h1 className="text-3xl font-display font-bold mb-2">{moduleName}</h1>
        
        {/* Content format indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4 text-secondary" />
          <span>
            AI Recommended: {contentFormat === 'video' ? 'Video-based' : contentFormat === 'text' ? 'Text-based' : 'Mixed'} learning
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tldr')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-all',
            activeTab === 'tldr'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          <Zap className="w-4 h-4 inline-block mr-2" />
          TL;DR
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-all',
            activeTab === 'content'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {contentFormat === 'video' || contentFormat === 'mixed' ? (
            <Play className="w-4 h-4 inline-block mr-2" />
          ) : (
            <FileText className="w-4 h-4 inline-block mr-2" />
          )}
          Full Content
        </button>
      </div>

      {/* Content Area */}
      <div className="neural-card rounded-2xl p-6 mb-8">
        {activeTab === 'tldr' ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-2">Quick Summary</h3>
                <p className="text-muted-foreground leading-relaxed">{content.tldr}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Concepts</h4>
              <div className="flex flex-wrap gap-2">
                {content.concepts.map((concept) => (
                  <span
                    key={concept}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video placeholder for video/mixed formats */}
            {(contentFormat === 'video' || contentFormat === 'mixed') && (
              <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm">Video content placeholder</p>
                </div>
              </div>
            )}
            
            {/* Text content */}
            <div className="prose prose-invert max-w-none">
              {content.textContent.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('# ')) {
                  return <h1 key={i} className="text-2xl font-display font-bold mt-6 mb-4">{paragraph.slice(2)}</h1>;
                } else if (paragraph.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-display font-semibold mt-5 mb-3">{paragraph.slice(3)}</h2>;
                } else if (paragraph.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-display font-medium mt-4 mb-2">{paragraph.slice(4)}</h3>;
                } else if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={i} className="list-disc list-inside space-y-1 text-muted-foreground">
                      {paragraph.split('\n').map((item, j) => (
                        <li key={j}>{item.slice(2)}</li>
                      ))}
                    </ul>
                  );
                } else {
                  return <p key={i} className="text-muted-foreground leading-relaxed">{paragraph}</p>;
                }
              })}
            </div>
          </div>
        )}
      </div>

      {/* Start Quiz CTA */}
      <div className="neural-card rounded-2xl p-6 text-center">
        <h3 className="font-display font-semibold mb-2">Ready to Test Your Knowledge?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Complete the module quiz to unlock the next topic
        </p>
        <Button onClick={onStartQuiz} className="bg-primary text-primary-foreground hover:bg-primary/90 neural-glow">
          Start Quiz
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
