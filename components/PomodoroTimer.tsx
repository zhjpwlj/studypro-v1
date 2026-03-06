
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Trees, Square, Clock } from 'lucide-react';
import { ActiveTimer, TimeEntry } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface PomodoroTimerProps {
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  onStartTimer: (description: string, project: string) => void;
  onStopTimer: () => void;
}

const SimpleTree: React.FC<{ progress: number }> = ({ progress }) => {
    // Progress 0 -> 1. 
    // We want tree to grow from seed (1) to full tree (0). 
    // Let's invert: 0% done = seed, 100% done (0 time left) = full tree.
    // So growth = 1 - progress.
    const growth = 1 - progress; 
    
    // Scale starts at 0.2 and goes to 1.0
    const scale = 0.2 + (growth * 0.8);
    const opacity = 0.5 + (growth * 0.5);

    return (
        <svg width="200" height="200" viewBox="0 0 100 100" className="drop-shadow-lg transition-all duration-1000" style={{ transform: `scale(${scale})`, opacity }}>
            {/* Trunk */}
            <path d="M45,100 L55,100 L55,80 L60,70 L40,70 L45,80 Z" fill="#8B4513" />
            {/* Foliage - grows with simple scale circles */}
            <circle cx="50" cy="50" r="25" fill="#22c55e" />
            <circle cx="35" cy="60" r="20" fill="#16a34a" />
            <circle cx="65" cy="60" r="20" fill="#15803d" />
            <circle cx="50" cy="30" r="20" fill="#4ade80" />
        </svg>
    )
};

const Pomodoro: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [shortBreakDuration, setShortBreakDuration] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short-break'>('focus');
  const [treesGrown, setTreesGrown] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            if (mode === 'focus') {
              setTreesGrown(p => p + 1);
            }
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusDuration : shortBreakDuration);
  };
  const changeMode = (newMode: 'focus' | 'short-break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? focusDuration : shortBreakDuration);
  };
  const applyPreset = (focusMin: number, breakMin: number) => {
    setFocusDuration(focusMin * 60);
    setShortBreakDuration(breakMin * 60);
    if (mode === 'focus') {
        setTimeLeft(focusMin * 60);
    } else {
        setTimeLeft(breakMin * 60);
    }
    setIsActive(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const totalDuration = mode === 'focus' ? focusDuration : shortBreakDuration;
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const circumference = 2 * Math.PI * 100;
  const dashoffset = circumference * (1 - progress);

  return (
     <div className="h-full flex flex-col items-center justify-center gap-6 p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm">
          <Trees size={16} /> <span>{treesGrown} {t('treesGrown')}</span>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg z-10">
        <button onClick={() => changeMode('focus')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'focus' ? 'bg-white dark:bg-slate-600 text-[var(--accent-color)] dark:text-white shadow-sm' : 'text-gray-500'}`}><Brain size={16} /> {t('focus')}</button>
        <button onClick={() => changeMode('short-break')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${mode === 'short-break' ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500'}`}><Coffee size={16} /> {t('break')}</button>
      </div>

      <div className="relative z-0">
        <svg width="240" height="240" className="-rotate-90">
            <circle cx="120" cy="120" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-slate-700" />
            <circle cx="120" cy="120" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-[var(--accent-color)]' : 'text-emerald-500'}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
             {/* Gamification Tree */}
             {mode === 'focus' && isActive && (
                 <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <SimpleTree progress={progress} />
                 </div>
             )}
            <div className="text-5xl font-bold text-slate-900 dark:text-white font-mono relative z-10 drop-shadow-sm">{formatTime(timeLeft)}</div>
            <div className="text-sm text-gray-500 mt-2 font-medium bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">{isActive ? (mode === 'focus' ? t('growing') : t('relaxing')) : t('paused')}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 z-10">
        <button onClick={toggleTimer} className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-[var(--accent-color)]'} text-white`}>{isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}</button>
        <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"><RotateCcw size={20} /></button>
      </div>

      <div className="w-full max-w-sm pt-4 border-t border-gray-200 dark:border-slate-700/50 grid grid-cols-2 gap-2 z-10">
        <button onClick={() => applyPreset(25, 5)} className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><span className="font-semibold text-slate-700 dark:text-slate-200">{t('standard')}</span><span className="text-xs block text-gray-500">25m • 5m</span></button>
        <button onClick={() => applyPreset(50, 10)} className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50"><span className="font-semibold text-slate-700 dark:text-slate-200">{t('deepWork')}</span><span className="text-xs block text-gray-500">50m • 10m</span></button>
      </div>
    </div>
  )
}

const Tracker: React.FC<PomodoroTimerProps> = ({ timeEntries, activeTimer, onStartTimer, onStopTimer }) => {
  const { t } = useContext(LanguageContext);
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('General');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: number;
    if (activeTimer) {
      setDescription(activeTimer.description);
      setProject(activeTimer.project);
      const updateElapsed = () => setElapsed(Math.floor((Date.now() - activeTimer.startTime) / 1000));
      updateElapsed();
      interval = window.setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
      setDescription('');
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStart = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onStartTimer(description, project);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/20 dark:border-black/20 flex-shrink-0">
        <form onSubmit={handleStart} className="flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-slate-700 p-3 rounded-lg">
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('workingOnPlaceholder')} disabled={!!activeTimer} className="flex-1 w-full bg-transparent border-0 focus:ring-0 text-lg text-slate-900 dark:text-white" />
          <div className="flex items-center gap-2">
            <select value={project} onChange={(e) => setProject(e.target.value)} disabled={!!activeTimer} className="bg-transparent border-0 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0"><option>{t('general')}</option><option>{t('university')}</option><option>{t('work')}</option></select>
            <div className="font-mono text-xl font-medium text-slate-900 dark:text-white">{formatTime(elapsed)}</div>
            <button type="button" onClick={activeTimer ? onStopTimer : handleStart} disabled={!activeTimer && !description.trim()} className={`${activeTimer ? 'bg-red-500' : 'bg-[var(--accent-color)]'} text-white p-3 rounded-lg disabled:opacity-50`}>
              {activeTimer ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {timeEntries.length > 0 ? (
          <div className="space-y-3">
            {timeEntries.map(entry => (
              <div key={entry.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{entry.description}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{entry.project}</span>
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-lg">{formatTime(entry.duration)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
            <Clock size={48} className="mb-4 opacity-20" />
            <p className="font-medium">{t('noTimeEntries')}</p>
            <p className="text-sm">{t('startTimerHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
};


const PomodoroTimer: React.FC<PomodoroTimerProps> = (props) => {
    const { t } = useContext(LanguageContext);
    const [view, setView] = useState<'pomodoro' | 'tracker'>('pomodoro');
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            <div className="p-2 flex justify-center bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                <div className="flex bg-gray-200 dark:bg-slate-700 p-1 rounded-lg">
                    <button onClick={() => setView('pomodoro')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'pomodoro' ? 'bg-white dark:bg-slate-600 shadow-sm text-[var(--accent-color)] dark:text-white' : 'text-gray-500'}`}>{t('pomodoro')}</button>
                    <button onClick={() => setView('tracker')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'tracker' ? 'bg-white dark:bg-slate-600 shadow-sm text-[var(--accent-color)] dark:text-white' : 'text-gray-500'}`}>{t('tracker')}</button>
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-900 overflow-hidden">
                {view === 'pomodoro' ? <Pomodoro /> : <Tracker {...props} />}
            </div>
        </div>
    )
}

export default PomodoroTimer;
