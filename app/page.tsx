'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { HabbitTracker } from '@/components/habbit-tracker';
import { MeditationTimer } from '@/components/meditation-timer';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [streakData, setStreakData] = useState<any>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [journalContent, setJournalContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchStreak();
    }
  }, [status, router]);

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/streak');
      if (res.ok) {
        const data = await res.json();
        setStreakData(data);
      }
      fetchJournals();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJournals = async () => {
      try {
          const res = await fetch('/api/journal');
          if (res.ok) {
              const data = await res.json();
              setJournals(data);
          }
      } catch (error) {
          console.error(error);
      }
  };

  const handleSaveJournal = async () => {
      if (!journalContent.trim()) return;
      try {
          const res = await fetch('/api/journal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: journalContent }),
          });
          if (res.ok) {
              setJournalContent('');
              fetchJournals();
          }
      } catch (error) {
          console.error(error);
      }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you relapsed? Use this to learn and grow, not to shame yourself.')) return;
    try {
      const res = await fetch('/api/streak', { method: 'POST' });
      if (res.ok) {
        localStorage.removeItem('streakStartDate');
        setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        fetchStreak();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getNextMilestone = (days: number) => {
    const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365];
    return milestones.find(m => m > days) || days + 1;
  };

  const getProgress = (days: number) => {
      if (isNaN(days)) return 0;
      const next = getNextMilestone(days);
      const prev = [0, 1, 3, 7, 14, 30, 60, 90, 180, 365].reverse().find(m => m <= days) || 0;
      if (next === prev) return 100;
      return Math.min(100, Math.max(0, ((days - prev) / (next - prev)) * 100));
  };

  /* Live Clock Logic */
  const [mounted, setMounted] = useState(false);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const startDateRef = React.useRef<string | null>(null);

  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true);
    // Read from localStorage after mount
    const cached = localStorage.getItem('streakStartDate');
    if (cached) {
      startDateRef.current = cached;
      // Calculate immediately
      const start = new Date(cached);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      if (diff >= 0) {
        setElapsed({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }
  }, []);

  // Update ref when API data arrives
  useEffect(() => {
    if (streakData?.startDate) {
      startDateRef.current = streakData.startDate;
      localStorage.setItem('streakStartDate', streakData.startDate);
    }
  }, [streakData]);

  // Single interval for updating elapsed time
  useEffect(() => {
    if (!mounted) return;

    const calculateTime = () => {
      if (!startDateRef.current) return;
      
      const start = new Date(startDateRef.current);
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      
      if (diff < 0) {
        setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setElapsed({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (status === 'loading' || loading || !mounted) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px]" />
        </div>

      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-white text-xs">NF</span>
            </div>
            <h1 className="text-lg font-medium tracking-tight text-slate-200">Focus Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden md:block">Hello, {session.user?.name || 'Friend'}</span>
          <Button 
            variant="ghost" 
            onClick={() => {
                localStorage.removeItem('streakStartDate');
                signOut();
            }} 
            className="text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Sign Out
          </Button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 space-y-12">
        
        {/* Hero Section */}
        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {/* Main Streak Card */}
            <Card className="col-span-1 lg:col-span-2 bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        Current Streak
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col pb-8 pt-4 relative z-10">
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-7xl md:text-9xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500 drop-shadow-2xl">
                            {elapsed.days}
                        </span>
                        <span className="text-2xl text-slate-500 font-light">days</span>
                    </div>
                    
                    {/* Detailed Counter */}
                    <div className="grid grid-cols-3 gap-8 border-t border-white/5 pt-6 max-w-md">
                        <div className="space-y-1">
                            <span className="text-4xl font-extralight text-slate-200 block tabular-nums">{elapsed.hours.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Hours</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-4xl font-extralight text-slate-200 block tabular-nums">{elapsed.minutes.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Mins</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-4xl font-extralight text-indigo-300 block tabular-nums animate-pulse">{elapsed.seconds.toString().padStart(2, '0')}</span>
                            <span className="text-[10px] text-indigo-500/80 uppercase tracking-widest font-semibold">Secs</span>
                        </div>
                    </div>
                </CardContent>
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out" 
                        style={{ width: `${getProgress(elapsed.days)}%` }}
                    />
                </div>
            </Card>

            {/* Motivation Quote Card */}
            <Card className="col-span-1 bg-slate-900/40 border-white/10 backdrop-blur-md flex flex-col justify-center relative overflow-hidden group hover:border-white/20 transition-all">
                 <div className="absolute inset-0 bg-gradient-to-bl from-rose-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-8 text-center relative z-10 flex flex-col items-center justify-center h-full">
                    <div className="mb-6 text-indigo-500/30">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H11.983C10.8784 16 9.98298 16.8954 9.98298 18L9.98298 21L7.98298 21V11H16.017V21H14.017ZM12.017 2L18.017 8H6.01698L12.017 2Z" /></svg>
                    </div>
                    <p className="text-lg font-light text-slate-200 italic leading-relaxed mb-6 font-serif">
                        "He who conquers others is strong; he who conquers himself is mighty."
                    </p>
                    <div className="w-12 h-[1px] bg-white/10 mb-2" />
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">— Lao Tzu</p>
                </CardContent>
            </Card>
        </section>

        {/* Stats & Actions Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             {/* Progress Detail */}
             <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm p-6 flex flex-col justify-between hover:bg-slate-900/60 transition-colors group">
                <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Next Milestone</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-semibold text-slate-200 group-hover:text-white transition-colors">
                            {getNextMilestone(elapsed.days)} 
                        </p>
                        <span className="text-sm text-slate-500 font-normal">days target</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                        <span>Progress</span>
                        <span className="text-indigo-400">{Math.round(getProgress(elapsed.days))}%</span>
                    </div>
                    <Progress value={getProgress(elapsed.days)} className="h-1 bg-white/5" />
                </div>
             </Card>

              {/* Quick Action - Relapse */}
             <Card className="col-span-1 lg:col-span-3 bg-gradient-to-r from-rose-950/10 to-slate-900/40 border-white/5 backdrop-blur-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="relative z-10">
                     <h3 className="text-xl font-light text-slate-200 mb-2">Feeling urge? <span className="text-rose-400 font-normal">Pause.</span></h3>
                     <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                        Don't trade your long-term peace for short-term pleasure. You are in control.
                     </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-300" onClick={() => window.open('https://www.youtube.com/watch?v=u31qwQUeGuM', '_blank')}>
                        Emergency Motivation
                    </Button>
                    <Button onClick={handleReset} variant="destructive" className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border border-rose-500/20 transition-all shadow-[0_0_20px_rgba(225,29,72,0.05)] hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                        I Relapsed
                    </Button>
                </div>
             </Card>
        </section>

        {/* Wellness Tools Section */}
        <section className="grid gap-6 md:grid-cols-2">
            <HabbitTracker />
            <MeditationTimer />
        </section>

        {/* Journal Section - Redesigned (Simplified) */}
        <section className="grid gap-8 md:grid-cols-3 items-start">
             {/* Write Entry */}
             <Card className="md:col-span-1 bg-slate-900/40 border-white/5 backdrop-blur-sm flex flex-col shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Daily Journal
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 pt-0">
                    <Textarea 
                        placeholder="Write your thoughts here..." 
                        className="flex-1 bg-slate-950/50 border-white/10 focus:border-indigo-500/50 resize-none text-slate-300 placeholder:text-slate-600 custom-scrollbar min-h-[150px] p-4 text-sm leading-relaxed focus:ring-1 focus:ring-indigo-500/20 transition-all rounded-md"
                        value={journalContent}
                        onChange={(e) => setJournalContent(e.target.value)}
                    />
                    <Button onClick={handleSaveJournal} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200 font-medium text-sm h-10 rounded-md">
                        Save Entry
                    </Button>
                </CardContent>
             </Card>

             {/* Recent Entries */}
             <Card className="md:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-md flex flex-col h-[400px] shadow-lg">
                <CardHeader className="border-b border-white/5 pb-4">
                    <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Past Reflections
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto custom-scrollbar flex-1 p-0">
                    {journals.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {journals.map((journal: any) => (
                                <div key={journal._id} className="p-5 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-400">
                                                {new Date(journal.createdAt).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-600">{new Date(journal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed pl-4 border-l-2 border-indigo-500/20">
                                        {journal.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <p className="text-sm text-slate-500">No entries yet. Start writing.</p>
                        </div>
                    )}
                </CardContent>
             </Card>
        </section>


        {/* History Section */}
        <section className="space-y-6">
            <h2 className="text-xl font-light text-slate-400 tracking-tight">Recent History</h2>
            <Card className="bg-slate-900/30 border-white/5 backdrop-blur-sm overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {streakData?.history && streakData.history.length > 0 ? (
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-white/5 text-slate-300 font-medium">
                            <tr>
                                <th className="p-4 pl-6">Event</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right pr-6">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {streakData.history.slice().reverse().map((date: string, i: number) => {
                             const d = new Date(date);
                             return (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 pl-6 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                                    Reset
                                </td>
                                <td className="p-4 text-slate-300">{d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                <td className="p-4 text-right pr-6 font-mono text-slate-500">{d.toLocaleTimeString()}</td>
                            </tr>
                        )})}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        <p>No resets recorded. Your journey is clean.</p>
                    </div>
                )}
                </div>
            </Card>
        </section>
      </main>
    </div>
  );
}
