import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const CalendarView: React.FC = () => {
  const events = [
    { id: 1, title: "Javascript Basics Review", time: "10:00 AM", type: "Revision", color: "bg-orange-100 text-orange-700" },
    { id: 2, title: "React Hooks Quiz", time: "02:00 PM", type: "Exam", color: "bg-red-100 text-red-700" },
    { id: 3, title: "Project Submission", time: "11:59 PM", type: "Deadline", color: "bg-indigo-100 text-indigo-700" },
  ];

  const days = Array.from({length: 31}, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-slate-800">Your Schedule</h1>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="font-medium text-slate-600">October 2026</span>
            <Button variant="outline" size="sm"><ChevronRight className="w-4 h-4" /></Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm font-medium text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
           </div>
           <div className="grid grid-cols-7 gap-2">
              {/* Empty slots for start of month */}
              {[1, 2, 3].map(i => <div key={`empty-${i}`} className="aspect-square text-transparent">.</div>)}
              
              {days.map(day => (
                 <div key={day} className={`aspect-square rounded-xl flex items-center justify-center text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${day === 14 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-700'}`}>
                    {day}
                 </div>
              ))}
           </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
             <CalendarIcon className="w-5 h-5 text-indigo-600" />
             Upcoming
           </h3>
           <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                      <Badge className={`${event.color} border-none`}>{event.type}</Badge>
                   </div>
                   <div className="flex items-center text-xs text-slate-500 gap-1">
                      <Clock className="w-3 h-3" />
                      {event.time}
                   </div>
                </div>
              ))}
              
              <Button className="w-full mt-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none shadow-none">
                 View All Events
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};
