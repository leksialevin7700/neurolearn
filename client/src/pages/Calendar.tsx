import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";

export const CalendarView: React.FC = () => {
   const [selectedDay, setSelectedDay] = useState(14);

   const events = [
      { id: 1, title: "Javascript Basics Review", time: "10:00 AM", type: "Revision", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
      { id: 2, title: "React Hooks Quiz", time: "02:00 PM", type: "Exam", color: "bg-red-500/10 text-red-400 border-red-500/20" },
      { id: 3, title: "Project Submission", time: "11:59 PM", type: "Deadline", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
   ];

   const days = Array.from({ length: 31 }, (_, i) => i + 1);

   const handleScheduleRevision = () => {
      toast.success(`Revision scheduled for Day ${selectedDay}!`, {
         description: "You'll receive a reminder 15 minutes before the session.",
      });
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold tracking-tight dark:text-white font-grotesk">Your Schedule</h1>
               <p className="text-muted-foreground mt-1">Manage your learning timeline and sessions</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></Button>
               <span className="px-4 font-bold text-sm text-slate-200 uppercase tracking-widest">January 2026</span>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Calendar Grid */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-800 backdrop-blur-sm bg-opacity-50">
               <CardContent className="p-8">
                  <div className="grid grid-cols-7 gap-4 mb-6 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                     {/* Empty slots for start of month - Simplified for Demo */}
                     {[1, 2, 3].map(i => <div key={`empty-${i}`} className="aspect-square"></div>)}

                     {days.map(day => (
                        <button
                           key={day}
                           onClick={() => setSelectedDay(day)}
                           className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm transition-all duration-300 relative group
                      ${day === selectedDay
                                 ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                                 : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700'}`}
                        >
                           <span className="font-bold">{day}</span>
                           {(day === 5 || day === 14 || day === 22) && (
                              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${day === selectedDay ? 'bg-indigo-200' : 'bg-indigo-500'}`} />
                           )}
                        </button>
                     ))}
                  </div>
               </CardContent>
            </Card>

            {/* Sidebar: Events & Call to Action */}
            <div className="space-y-6">
               <Card className="bg-slate-900 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        Day {selectedDay}
                     </CardTitle>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <Plus className="w-4 h-4" />
                     </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {selectedDay === 14 ? (
                        events.map((event) => (
                           <div key={event.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-indigo-500/50 transition-all group">
                              <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm">{event.title}</h4>
                                 <Badge variant="outline" className={`${event.color} text-[10px] uppercase font-bold`}>{event.type}</Badge>
                              </div>
                              <div className="flex items-center text-xs text-slate-500 gap-1 mt-3">
                                 <Clock className="w-3.5 h-3.5" />
                                 {event.time}
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="py-12 text-center space-y-3">
                           <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
                              <Plus className="w-6 h-6 text-slate-500" />
                           </div>
                           <p className="text-sm text-slate-500">No events scheduled for this day</p>
                           <Button
                              onClick={handleScheduleRevision}
                              variant="link"
                              className="text-indigo-400 text-xs h-auto p-0"
                           >
                              Schedule Revision Session
                           </Button>
                        </div>
                     )}

                     <Button
                        onClick={handleScheduleRevision}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] border-none"
                     >
                        <Bell className="w-4 h-4 mr-2" />
                        Schedule Session
                     </Button>
                  </CardContent>
               </Card>

               <Card className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border-slate-800">
                  <CardContent className="p-6">
                     <h4 className="font-bold text-white mb-2">Study Tip</h4>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        Space out your revision sessions. The AI recommends a 2-day gap for "Linked Lists" to maximize your retention.
                     </p>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
};

