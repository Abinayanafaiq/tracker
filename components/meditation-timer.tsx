'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function MeditationTimer() {
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { label: '5m', sec: 300 },
    { label: '10m', sec: 600 },
    { label: '15m', sec: 900 },
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    if (isActive) return;
    setIsActive(true);
    setIsFinished(false);
    intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                finishSession();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(duration);
    setIsFinished(false);
  };

  const finishSession = async () => {
      pauseTimer();
      setIsFinished(true);
      // Play sound?
      
      // Log to API
      try {
          await fetch('/api/meditation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ duration }),
          });
      } catch (error) {
          console.error('Failed to log session', error);
      }
  };

  const setPreset = (sec: number) => {
      pauseTimer();
      setDuration(sec);
      setTimeLeft(sec);
      setIsFinished(false);
  };

  const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-lg flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Meditation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Timer Display */}
        <div className="relative group">
             {/* Glow effect */}
             <div className={`absolute inset-0 bg-sky-500/20 blur-3xl rounded-full transition-opacity duration-1000 ${isActive ? 'opacity-50' : 'opacity-0'}`} />
            
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Ring Background */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-slate-800" strokeWidth="2" />
                    <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * timeLeft) / duration}
                        className={`transition-all duration-1000 ease-linear ${isActive ? 'text-sky-400' : 'text-slate-600'}`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="flex flex-col items-center z-10 space-y-1">
                    <span className="text-5xl font-extralight text-slate-100 tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
                    <span className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${isActive ? 'text-sky-400 animate-pulse' : 'text-slate-600'}`}>
                        {isActive ? 'Focus' : isFinished ? 'Completed' : 'Ready'}
                    </span>
                </div>
            </div>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col items-center gap-6 w-full">
            {/* Primary Actions */}
            <div className="flex items-center gap-4">
                {!isActive ? (
                    <Button onClick={startTimer} className="bg-sky-500 hover:bg-sky-600 text-white rounded-full w-14 h-14 p-0 shadow-lg shadow-sky-500/20 transition-all hover:scale-105">
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </Button>
                ) : (
                    <Button onClick={pauseTimer} className="bg-slate-800 hover:bg-slate-700 text-white rounded-full w-14 h-14 p-0 border border-white/10 transition-all hover:scale-105">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    </Button>
                )}
                
                {(timeLeft !== duration || isFinished) && (
                    <Button onClick={resetTimer} variant="ghost" className="text-slate-500 hover:text-white rounded-full w-10 h-10 p-0 hover:bg-white/5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </Button>
                )}
            </div>

            {/* Presets */}
            <div className="flex gap-2 bg-slate-950/50 p-1 rounded-full border border-white/5">
                {presets.map(p => (
                    <button 
                        key={p.label}
                        onClick={() => setPreset(p.sec)}
                        className={`text-[10px] font-medium px-4 py-1.5 rounded-full transition-all ${duration === p.sec ? 'bg-sky-500/10 text-sky-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
