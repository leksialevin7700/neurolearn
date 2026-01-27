import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlayCircle, FileText, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Content Database (Simulating Backend "Module-learn" response)
const MODULE_CONTENT = {
  webdev: {
    title: "HTML5 Semantics & Structure",
    tldr: "Semantic HTML improves accessibility and SEO by giving meaning to page structure.",
    videoUrl: "https://www.youtube.com/embed/qz0aGYrrlhU", // Placeholder
    text: `
      # Why Semantics Matter
      
      Semantic HTML elements clearly describe their meaning in a human- and machine-readable way. Elements such as \`<header>\`, \`<footer>\`, and \`<article>\` are all considered semantic because they accurately describe the purpose of the element and the type of content that is inside them.
      
      ## Key Elements
      * **<header>**: Introductory content or nav links.
      * **<nav>**: Navigation links.
      * **<main>**: Dominant content of the body.
      * **<article>**: Self-contained content (blog post).
      * **<section>**: Thematic grouping of content.
      
      Using these tags helps screen readers and search engines understand your page structure better than using generic \`<div>\` tags.
    `,
    quizId: "module-1-quiz"
  },
  dsa: {
    title: "Arrays & Time Complexity",
    tldr: "Arrays allow O(1) random access but O(n) insertion/deletion. Understanding this trade-off is key.",
    videoUrl: "https://www.youtube.com/embed/RBSGKlAvoiM",
    text: `
      # Array Fundamentals
      
      An array is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together.
      
      ## Time Complexity
      * **Access**: O(1) - Instant because it's just a memory offset calc.
      * **Search**: O(n) - Linear scan (unless sorted + binary search).
      * **Insertion**: O(n) - Shifting elements is required.
      * **Deletion**: O(n) - Shifting elements is required.
      
      Arrays are the building blocks of more complex structures like Heaps, Hash Tables, and ArrayLists.
    `,
    quizId: "module-2-quiz"
  }
};

export const ModuleLearning: React.FC = () => {
    const { domainId, moduleId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate Backend Fetch
        // In real app: fetch(\`\${import.meta.env.VITE_API_URL}/api/module-learn/\${moduleId}\`)
        setTimeout(() => {
             const data = MODULE_CONTENT[domainId as keyof typeof MODULE_CONTENT] || MODULE_CONTENT.webdev;
             setContent(data);
             setLoading(false);
        }, 800);
    }, [domainId, moduleId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading module content...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 animate-fade-in">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                 <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-slate-400 hover:text-indigo-500 pl-0">
                    ← Back to Roadmap
                 </Button>
                 <div className="flex items-center gap-3 mb-2">
                     <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                         Module {moduleId}
                     </span>
                     <span className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase">
                         <PlayCircle className="w-3 h-3" /> Video & Reading
                     </span>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{content.title}</h1>
                 
                 {/* TL;DR Box */}
                 <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 p-4 rounded-xl flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0 text-yellow-600">
                         <span className="font-bold text-xs">TL;DR</span>
                     </div>
                     <p className="text-yellow-800 dark:text-yellow-200/80 text-sm leading-relaxed pt-1">
                         {content.tldr}
                     </p>
                 </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Main Content Column */}
                 <div className="lg:col-span-2 space-y-8">
                     
                     {/* Video Player */}
                     <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black">
                         <iframe 
                            width="100%" 
                            height="100%" 
                            src={content.videoUrl} 
                            title="Module Video"
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                         ></iframe>
                     </div>

                     {/* Text Content */}
                     <div className="prose dark:prose-invert max-w-none">
                         {/* Simple parser for demo (Real app would use ReactMarkdown) */}
                         {content.text.split('\n').map((line: string, i: number) => {
                             if (line.trim().startsWith('# ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h2>;
                             if (line.trim().startsWith('## ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-indigo-400">{line.replace('## ', '')}</h3>;
                             if (line.trim().startsWith('* ')) return <li key={i} className="ml-4 list-disc text-slate-600 dark:text-slate-300 mb-2">{line.replace('* ', '')}</li>;
                             return <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{line}</p>;
                         })}
                     </div>

                     {/* Bottom Action */}
                     <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                         <div>
                             <h4 className="font-bold text-slate-900 dark:text-white">Ready to test your knowledge?</h4>
                             <p className="text-sm text-slate-500">Take a quick mini-quiz to complete this module.</p>
                         </div>
                         <Button onClick={() => navigate(`/quiz/diagnostic/${domainId}`, { state: { fromModule: true } })} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                             Start Mini Quiz <ArrowRight className="w-4 h-4 ml-2" />
                         </Button>
                     </div>
                 </div>

                 {/* Sidebar Column */}
                 <div className="space-y-6">
                     <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6">
                         <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                             <BookOpen className="w-4 h-4 text-indigo-500" /> Lesson Resources
                         </h3>
                         <ul className="space-y-3">
                             <li className="flex items-center gap-2 text-sm text-indigo-400 cursor-pointer hover:underline">
                                 <FileText className="w-4 h-4" /> Cheat Sheet.pdf
                             </li>
                             <li className="flex items-center gap-2 text-sm text-indigo-400 cursor-pointer hover:underline">
                                 <PlayCircle className="w-4 h-4" /> Source Code
                             </li>
                         </ul>
                     </Card>
                 </div>
            </div>
        </div>
    );
};
