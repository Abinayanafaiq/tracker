'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


interface Habbit {
  _id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[]; // ISO strings
}

export function HabbitTracker() {
  const [habbits, setHabbits] = useState<Habbit[]>([]);
  const [newHabbitName, setNewHabbitName] = useState('');
  const [newHabbitFreq, setNewHabbitFreq] = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabbits();
  }, []);

  const fetchHabbits = async () => {
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        const data = await res.json();
        setHabbits(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabbit = async () => {
    if (!newHabbitName.trim()) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabbitName, frequency: newHabbitFreq }),
      });
      if (res.ok) {
        setNewHabbitName('');
        fetchHabbits();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleHabbit = async (id: string) => {
    try {
      const today = new Date().toISOString();
      const res = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, date: today }),
      });
      
      if (res.ok) {
        // Optimistic update
        const updatedHabit = await res.json();
        setHabbits(prev => prev.map(h => h._id === id ? updatedHabit : h));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isCompletedToday = (dates: string[]) => {
    const today = new Date().setHours(0,0,0,0);
    return dates.some(d => new Date(d).setHours(0,0,0,0) === today);
  };

  return (
    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-lg flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Habit Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col p-6 pt-0">
        {/* Add New Habit Form */}
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Input 
                    placeholder="New habit..." 
                    value={newHabbitName}
                    onChange={(e) => setNewHabbitName(e.target.value)}
                    className="bg-slate-950/50 border-white/10 text-slate-300 h-10 text-sm focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all pr-20"
                />
                <select 
                    value={newHabbitFreq} 
                    onChange={(e) => setNewHabbitFreq(e.target.value as 'daily' | 'weekly')}
                    className="absolute right-0 top-0 bottom-0 bg-transparent border-l border-white/10 text-slate-500 text-xs px-2 focus:outline-none hover:text-slate-300 transition-colors cursor-pointer"
                >
                    <option value="daily" className="bg-slate-900">Daily</option>
                    <option value="weekly" className="bg-slate-900">Weekly</option>
                </select>
            </div>
            <Button onClick={handleAddHabbit} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-10 w-10 p-0 rounded-md transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </Button>
        </div>

        {/* Habits List */}
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {habbits.map(habbit => {
                const completed = isCompletedToday(habbit.completedDates);
                
                // Monthly Stats Calculation
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                const daysInMonthSoFar = now.getDate();
                
                const completedThisMonth = habbit.completedDates.filter(d => {
                    const date = new Date(d);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                }).length;

                // For daily habits, target is days passed. For weekly, target is approx days/7 (simplified).
                // To keep it robust/simple for now, we'll just show completion % against "days so far" for daily,
                // and just the count for weekly or general stats.
                // Actually, let's Stick to User Plan: (completed / days_passed) * 100 for Daily.
                // For Weekly, we might just show the count to avoid confusion 
                // OR we can adjust logic: if weekly, target = Math.ceil(daysInMonthSoFar / 7).
                
                let target = daysInMonthSoFar;
                if (habbit.frequency === 'weekly') {
                     target = Math.ceil(daysInMonthSoFar / 7);
                }

                // Cap percentage at 100% just in case (e.g. multiple entries per day bug, though current logic prevents toggle ON duplicates, toggle OFF removes)
                const percentage = Math.min(100, Math.round((completedThisMonth / target) * 100));

                return (
                    <div key={habbit._id} className="group flex flex-col p-3 bg-slate-950/30 rounded-lg border border-white/5 hover:border-white/10 transition-all hover:bg-slate-950/50 gap-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-1 h-8 rounded-full transition-colors ${completed ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium transition-colors ${completed ? 'text-slate-300 line-through decoration-slate-600' : 'text-slate-200'}`}>{habbit.name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{habbit.frequency}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleHabbit(habbit._id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    completed 
                                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                                    : 'bg-slate-800/50 text-slate-600 hover:bg-emerald-500/10 hover:text-emerald-500/50'
                                }`}
                            >
                                {completed && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        </div>
                        
                        {/* Monthly Progress Bar */}
                        <div className="pl-4 pr-1">
                             <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] text-slate-500">Monthly Progress</span>
                                <span className="text-[10px] font-medium text-slate-400">{completedThisMonth}/{target} {habbit.frequency === 'daily' ? 'days' : 'weeks'} ({percentage}%)</span>
                             </div>
                             <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500/50 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                             </div>
                        </div>
                    </div>
                );
            })}
            {habbits.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-32 text-slate-600 space-y-2 border-2 border-dashed border-white/5 rounded-lg">
                    <p className="text-xs">No habits tracked yet</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
