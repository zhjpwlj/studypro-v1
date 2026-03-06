import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, CloudRain, Trees, Wind, Zap } from 'lucide-react';

const FocusTimer: React.FC = () => {
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short-break'>('focus');
  const timerRef = useRef<number | null>(null);
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'forest' | 'white-noise'>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sounds = useMemo(() => ({
    rain: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3',
    forest: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3',
    'white-noise': 'https://assets.mixkit.co/sfx/preview/mixkit-wind-in-the-trees-1234.mp3'
  }), []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
    }
    const audio = audioRef.current;
    if (activeSound === 'none') {
        audio.pause();
    } else {
        audio.src = sounds[activeSound];
        audio.play().catch(e => console.error("Audio play failed:", e));
    }
    return () => { audio.pause(); };
  }, [activeSound, sounds]);

  const toggleTimer = (): void => setIsActive(!isActive);
  const resetTimer = (): void => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusDuration : shortBreakDuration);
  };
  const changeMode = (newMode: 'focus' | 'short-break'): void => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? focusDuration : shortBreakDuration);
  };
  const applyPreset = (focusMin: number, breakMin: number): void => {
    setFocusDuration(focusMin * 60);
    setShortBreakDuration(breakMin * 60);
    changeMode('focus');
    setTimeLeft(focusMin * 60);
  };

  const formatTime = (s: number): string => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const totalDuration = mode === 'focus' ? focusDuration : shortBreakDuration;
  const progress = timeLeft / totalDuration;
  const circumference = 2 * Math.PI * 100;
  const dashoffset = circumference * (1 - progress);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-4">
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
        <button onClick={() => changeMode('focus')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'focus' ? 'bg-white dark:bg-slate-600 text-[var(--accent-color)] dark:text-white shadow-sm' : 'text-gray-500'}`}><Brain size={16} /> Focus</button>
        <button onClick={() => changeMode('short-break')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'short-break' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500'}`}><Coffee size={16} /> Break</button>
      </div>

      <div className="relative">
        <svg width="240" height="240" className="-rotate-90"><circle cx="120" cy="120" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-slate-700" /><circle cx="120" cy="120" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-[var(--accent-color)]' : 'text-emerald-500'}`} /></svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-5xl font-bold text-slate-900 dark:text-white font-mono">{formatTime(timeLeft)}</div></div>
      </div>
      
      <div className="flex items-center gap-4">
        <button onClick={toggleTimer} className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${isActive ? 'bg-amber-500' : 'bg-[var(--accent-color)]'} text-white`}>{isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}</button>
        <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center"><RotateCcw size={20} /></button>
      </div>

      <div className="w-full max-w-sm pt-4 border-t border-gray-200 dark:border-slate-700/50 grid grid-cols-2 gap-2">
        <button onClick={() => applyPreset(25, 5)} className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><span className="font-semibold text-slate-700 dark:text-slate-200">Standard</span><span className="text-xs block text-gray-500">25m • 5m</span></button>
        <button onClick={() => applyPreset(50, 10)} className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><span className="font-semibold text-slate-700 dark:text-slate-200">Deep Work</span><span className="text-xs block text-gray-500">50m • 10m</span></button>
      </div>
       <div className="w-full max-w-sm pt-2 grid grid-cols-4 gap-2">
           {[ { id: 'none', icon: Zap }, { id: 'rain', icon: CloudRain }, { id: 'forest', icon: Trees }, { id: 'white-noise', icon: Wind } ].map(s => (
               <button key={s.id} onClick={() => setActiveSound(s.id as 'none' | 'rain' | 'forest' | 'white-noise')} className={`p-3 rounded-lg flex justify-center ${activeSound === s.id ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-slate-700/50 text-gray-500'}`}><s.icon size={18} /></button>
           ))}
       </div>
    </div>
  );
};

export default FocusTimer;