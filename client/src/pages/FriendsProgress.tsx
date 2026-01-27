import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Star, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const FRIENDS_DATA = [
    {
        id: 1,
        name: 'Alex Rivera',
        avatar: 'https://i.pravatar.cc/150?u=alex',
        level: 14,
        currentCourse: 'DSA Mastery',
        progress: 75,
        streak: 12,
        status: 'online',
    },
    {
        id: 2,
        name: 'Sarah Chen',
        avatar: 'https://i.pravatar.cc/150?u=sarah',
        level: 22,
        currentCourse: 'Fullstack Web',
        progress: 92,
        streak: 45,
        status: 'learning',
    },
    {
        id: 3,
        name: 'Marcus Thorne',
        avatar: 'https://i.pravatar.cc/150?u=marcus',
        level: 8,
        currentCourse: 'AI Fundamentals',
        progress: 34,
        streak: 3,
        status: 'offline',
    },
    {
        id: 4,
        name: 'Jamie Vance',
        avatar: 'https://i.pravatar.cc/150?u=jamie',
        level: 19,
        currentCourse: 'System Design',
        progress: 58,
        streak: 21,
        status: 'learning',
    }
];

export const FriendsProgress: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">Community & Friends</h1>
                    <p className="text-muted-foreground mt-1">See how your learning circle is progressing</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search friends..." className="pl-10 dark:bg-slate-900 border-slate-800" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Friends List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {FRIENDS_DATA.map((friend) => (
                            <Card key={friend.id} className="dark:bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all group">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-indigo-500/20">
                                                    <AvatarImage src={friend.avatar} alt={friend.name} />
                                                    <AvatarFallback>{friend.name.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${friend.status === 'online' ? 'bg-green-500' :
                                                        friend.status === 'learning' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-500'
                                                    }`} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold dark:text-white group-hover:text-indigo-400 transition-colors">{friend.name}</h3>
                                                <p className="text-xs text-muted-foreground">Level {friend.level}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] py-0 h-5 border-indigo-500/30 text-indigo-400">
                                            {friend.streak} Day Streak
                                        </Badge>
                                    </div>

                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">{friend.currentCourse}</span>
                                            <span className="font-medium dark:text-white">{friend.progress}%</span>
                                        </div>
                                        <Progress value={friend.progress} className="h-1.5 bg-slate-800" indicatorClassName="bg-indigo-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="dark:bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                                <TrendingUp className="h-5 w-5 text-indigo-500" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { user: 'Sarah Chen', action: 'completed a quiz in React Hooks', time: '12m ago', icon: '📝' },
                                    { user: 'Alex Rivera', action: 'achieved 10-day streak!', time: '1h ago', icon: '🔥' },
                                    { user: 'Jamie Vance', action: 'started Learning Path: System Design', time: '3h ago', icon: '🚀' },
                                    { user: 'Marcus Thorne', action: 'unlocked "Array Master" achievement', time: '5h ago', icon: '🏆' },
                                ].map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4 text-sm border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                                        <span className="text-xl">{activity.icon}</span>
                                        <div className="flex-1">
                                            <p className="dark:text-slate-300">
                                                <span className="font-bold text-indigo-400">{activity.user}</span> {activity.action}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Leaderboard & Stats */}
                <div className="space-y-6">
                    <Card className="dark:bg-slate-900 border-slate-800 bg-gradient-to-br from-slate-900 to-indigo-950/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Weekly Leaderboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="px-6 pb-6 space-y-4">
                                {FRIENDS_DATA.sort((a, b) => b.level - a.level).map((friend, i) => (
                                    <div key={friend.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-bold w-4 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : 'text-orange-600'}`}>
                                                {i + 1}
                                            </span>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={friend.avatar} />
                                                <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium dark:text-slate-200 group-hover:text-white transition-colors">
                                                {friend.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-indigo-500 text-indigo-500" />
                                            <span className="text-xs font-bold dark:text-indigo-400">{friend.level * 100 + friend.progress * 5} XP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                                <Users className="h-5 w-5 text-indigo-500" />
                                Learning Circle
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                    <p className="text-2xl font-bold text-white">12</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Friends</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                    <p className="text-2xl font-bold text-white">4</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Now</p>
                                </div>
                            </div>
                            <button className="w-full mt-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                                Invite Friends
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
