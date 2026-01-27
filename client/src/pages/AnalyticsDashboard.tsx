import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy, Clock, BarChart2, Brain, CheckCircle2, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const MOCK_CONCEPT_DATA = [
  { name: 'Arrays', score: 85, color: '#2dd4bf' }, // teal-400
  { name: 'Strings', score: 65, color: '#facc15' }, // yellow-400
  { name: 'Maps', score: 92, color: '#38bdf8' },   // sky-400
  { name: 'Trees', score: 45, color: '#f87171' },  // red-400
];

export const AnalyticsDashboard: React.FC = () => {
    const { domainId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve real data or fallback to defaults
    const { score, totalTime, totalQuestions, conceptData } = location.state || { 
        score: 0, 
        totalTime: 0, 
        totalQuestions: 5,
        conceptData: MOCK_CONCEPT_DATA 
    };

    // Use passed concept data if available, otherwise mock
    const chartData = conceptData || MOCK_CONCEPT_DATA;

    // Analysis Logic
    const getAnalysis = () => {
        const percentage = (score / totalQuestions) * 100;
        if (percentage < 50) return { title: "Needs Improvement", desc: "We identified some gaps in foundational concepts.", color: "text-red-400" };
        if (percentage < 80) return { title: "Good Start", desc: "You have a decent grasp, but some revision is needed.", color: "text-yellow-400" };
        return { title: "Excellent!", desc: "You have a strong command of these concepts!", color: "text-green-400" };
    };

    const analysis = getAnalysis();

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
               <div>
                  <h1 className="text-3xl font-bold text-white font-grotesk">NeuroLearn Analytics</h1>
                  <p className="text-slate-400">Deep dive into your learning patterns</p>
               </div>
               <Button onClick={() => navigate(`/roadmap/${domainId}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                   View Roadmap <ArrowRight className="w-4 h-4" />
               </Button>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                   { icon: Target, label: "Progress", value: "0%", sub: "0/5 modules", color: "bg-cyan-500/10 text-cyan-400" },
                   { icon: Trophy, label: "Avg Score", value: `${(score/totalQuestions * 100).toFixed(0)}%`, sub: "across quizzes", color: "bg-yellow-500/10 text-yellow-400" },
                   { icon: Clock, label: "Time Spent", value: `${Math.floor((5 * 60 - totalTime)/60)}m`, sub: "total learning", color: "bg-purple-500/10 text-purple-400" },
                   { icon: BarChart2, label: "Quizzes", value: "1", sub: "completed", color: "bg-green-500/10 text-green-400" },
                ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                        <Card className="bg-slate-900 border-slate-800 backdrop-blur-sm bg-opacity-50">
                            <CardContent className="p-6">
                                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                                <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Module Progress */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <BarChart2 className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-white">Module Progress</CardTitle>
                                <p className="text-sm text-slate-400">Data Structures & Algorithms</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { id: 1, name: "Arrays", status: "In Progress" },
                            { id: 2, name: "Linked Lists", status: "Locked" },
                            { id: 3, name: "Stacks", status: "Locked" },
                            { id: 4, name: "Queues", status: "Locked" }
                        ].map((mod, i) => (
                            <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                    {mod.id}
                                </div>
                                <span className={`text-sm font-medium flex-1 ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{mod.name}</span>
                                {i === 0 && <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">Current</span>}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Concept Analysis (Analysis Logic Display) */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-white">Concept Analysis</CardTitle>
                                <p className="text-sm text-slate-400">Your strengths & areas to improve</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                       {score > 0 ? (
                           <div className="space-y-6">
                               <div className="flex items-center justify-between">
                                  <div>
                                      <h4 className={`font-bold ${analysis.color} text-lg`}>{analysis.title}</h4>
                                      <p className="text-slate-400 text-sm max-w-sm">{analysis.desc}</p>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-2xl font-bold text-white">{(score / totalQuestions * 100).toFixed(0)}%</div>
                                      <div className="text-xs text-slate-500">Correct Answers</div>
                                  </div>
                               </div>
                               
                               {/* Recharts Bar Chart */}
                               <div className="h-48 w-full mt-4">
                                   <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={chartData}>
                                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                          <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            cursor={{fill: 'transparent'}}
                                          />
                                          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#2dd4bf'} />
                                            ))}
                                          </Bar>
                                      </BarChart>
                                   </ResponsiveContainer>
                               </div>
                           </div>
                       ) : (
                           <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                               <div className="bg-slate-800 p-4 rounded-full">
                                    <Brain className="w-8 h-8 text-slate-500" />
                               </div>
                               <p className="text-slate-400">Complete quizzes to see your concept analysis</p>
                           </div>
                       )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};
