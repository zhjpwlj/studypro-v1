import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Globe, Timer as StopwatchIcon, Hourglass, Play, Pause, RotateCcw, Flag, CalendarDays, CheckSquare, GraduationCap } from 'lucide-react';
import { Event, Task, Class } from '../types';

const cities = [
  { name: 'New York', timeZone: 'America/New_York' },
  { name: 'London', timeZone: 'Europe/London' },
  { name: 'Tokyo', timeZone: 'Asia/Tokyo' },
  { name: 'Sydney', timeZone: 'Australia/Sydney' },
];

const WorldClock = (): JSX.Element => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval((): void => setTime(new Date()), 1000);
    return (): void => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date, timeZone: string): string => date.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDate = (date: Date, timeZone: string): string => date.toLocaleDateString('en-US', { timeZone, weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-400">Local Time</h3>
        <p className="text-5xl font-bold font-mono tracking-tighter">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
        <p className="text-slate-300">{time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="space-y-4">
        {cities.map(city => (
          <div key={city.name} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg">
            <div>
              <p className="text-xl font-semibold">{city.name}</p>
              <p className="text-sm text-slate-400">{formatDate(time, city.timeZone)}</p>
            </div>
            <p className="text-3xl font-mono font-bold">{formatTime(time, city.timeZone)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatStopwatchTime = (time: number): string => {
    const milliseconds = `00${time % 1000}`.slice(-3);
    const seconds = `0${Math.floor(time / 1000) % 60}`.slice(-2);
    const minutes = `0${Math.floor(time / 60000) % 60}`.slice(-2);
    return `${minutes}:${seconds}.${milliseconds}`;
};

const Stopwatch = (): JSX.Element => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    const timerRef = useRef<number | null>(null);

    const handleStartStop = (): void => setIsRunning(!isRunning);
    const handleReset = (): void => { setIsRunning(false); setTime(0); setLaps([]); };
    const handleLap = (): void => { if (isRunning) setLaps(prev => [time, ...prev]); };

    useEffect(() => {
        if (isRunning) {
            const startTime = Date.now() - time;
            timerRef.current = window.setInterval((): void => setTime(Date.now() - startTime), 10);
        } else if (timerRef.current) clearInterval(timerRef.current);
        return (): void => { if (timerRef.current) clearInterval(timerRef.current) };
    }, [isRunning, time]);

    return (
        <div className="p-6 flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center">
                <p className="text-7xl font-mono font-bold tracking-tighter">{formatStopwatchTime(time)}</p>
            </div>
            <div className="flex justify-center gap-4 mb-6">
                <button onClick={handleReset} className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center"><RotateCcw size={24} /></button>
                <button onClick={handleStartStop} className={`w-20 h-20 rounded-full flex items-center justify-center text-white ${isRunning ? 'bg-red-500' : 'bg-green-500'}`}>
                    {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <button onClick={handleLap} disabled={!isRunning} className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center disabled:opacity-50"><Flag size={24} /></button>
            </div>
            <div className="h-40 overflow-y-auto bg-slate-800/50 rounded-lg p-2 space-y-2">
                {laps.map((lap, i) => (
                    <div key={i} className="flex justify-between p-2 text-lg font-mono rounded bg-slate-900/50">
                        <span>Lap {laps.length - i}</span>
                        <span>{formatStopwatchTime(lap - (laps[i+1] || 0) )}</span>
                        <span>{formatStopwatchTime(lap)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Timer = (): JSX.Element => {
    const [duration, setDuration] = useState(300);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<number | null>(null);
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!alarmAudioRef.current) alarmAudioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3');
    }, []);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval((): void => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            alarmAudioRef.current?.play();
        }
        return (): void => { if (timerRef.current) clearInterval(timerRef.current) };
    }, [isActive, timeLeft]);
    
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>, unit: 'h' | 'm' | 's'): void => {
        const value = parseInt(e.target.value, 10) || 0;
        const { h, m, s } = formatTime(duration);
        let newDuration;
        if (unit === 'h') newDuration = value * 3600 + m * 60 + s;
        else if (unit === 'm') newDuration = h * 3600 + value * 60 + s;
        else newDuration = h * 3600 + m * 60 + value;
        
        setDuration(newDuration);
        if(!isActive) setTimeLeft(newDuration);
    };
    
    const formatTime = (s: number): { h: number; m: number; s: number } => ({ h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    const {h, m, s} = formatTime(timeLeft);
    const progress = duration > 0 ? timeLeft / duration : 0;
    const circumference = 2 * Math.PI * 100;
    const dashoffset = circumference * (1 - progress);

    return (
        <div className="p-6 flex flex-col h-full items-center justify-between">
            <div className="relative">
                <svg width="240" height="240" className="-rotate-90"><circle cx="120" cy="120" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-700" /><circle cx="120" cy="120" r="100" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-linear text-accent" /></svg>
                <div className="absolute inset-0 flex items-center justify-center"><div className="text-5xl font-bold text-white font-mono">{`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}</div></div>
            </div>
            <div className="flex gap-4 items-center font-mono text-4xl">
                <input type="number" min="0" max="23" value={formatTime(duration).h} onChange={e => handleDurationChange(e, 'h')} disabled={isActive} className="w-20 bg-slate-800 text-center rounded-lg p-2" />:
                <input type="number" min="0" max="59" value={formatTime(duration).m} onChange={e => handleDurationChange(e, 'm')} disabled={isActive} className="w-20 bg-slate-800 text-center rounded-lg p-2" />:
                <input type="number" min="0" max="59" value={formatTime(duration).s} onChange={e => handleDurationChange(e, 's')} disabled={isActive} className="w-20 bg-slate-800 text-center rounded-lg p-2" />
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => { setIsActive(false); setTimeLeft(duration); }} className="w-16 h-16 rounded-full bg-slate-700 text-white flex items-center justify-center"><RotateCcw size={24} /></button>
                <button onClick={() => setIsActive(p => !p)} className={`w-20 h-20 rounded-full flex items-center justify-center text-white ${isActive ? 'bg-amber-500' : 'bg-accent'}`}>{isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}</button>
            </div>
        </div>
    );
};

const Agenda: React.FC<{events: Event[], tasks: Task[], classes: Class[]}> = ({ events, tasks, classes }) => {
    const agendaItems = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const dayOfWeek = today.getDay();

        const todayEvents = events.filter(e => e.date === todayStr).map(e => ({ type: 'event', time: 'All Day', title: e.title, color: e.color, icon: <CalendarDays size={16}/> }));
        const todayTasks = tasks.filter(t => t.deadline === todayStr && !t.completed).map(t => ({ type: 'task', time: t.deadlineTime || 'Deadline', title: t.title, color: '#94a3b8', icon: <CheckSquare size={16}/> }));
        const todayClasses = classes.flatMap(c => c.sessions.filter(s => s.dayOfWeek === dayOfWeek).map(s => ({ type: 'class', time: s.startTime, title: c.name, color: c.color, icon: <GraduationCap size={16}/>})));
        
        return [...todayEvents, ...todayTasks, ...todayClasses].sort((a,b) => a.time.localeCompare(b.time));
    }, [events, tasks, classes]);

    return (
        <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold">Today&apos;s Agenda</h3>
            {agendaItems.length > 0 ? agendaItems.map((item, index) => (
                 <div key={index} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                    <div className="w-16 text-right text-sm font-semibold text-slate-400">{item.time}</div>
                    <div className="flex-shrink-0 w-1 h-8 rounded-full" style={{backgroundColor: item.color}}></div>
                    <div className="flex-1 flex items-center gap-3">
                        <div className="text-slate-400">{item.icon}</div>
                        <span className="font-medium text-sm">{item.title}</span>
                    </div>
                </div>
            )) : <p className="text-slate-400">Nothing on the agenda for today.</p>}
        </div>
    )
}

interface ClockProps {
    events: Event[];
    tasks: Task[];
    classes: Class[];
}

const Clock: React.FC<ClockProps> = ({ events, tasks, classes }) => {
    const [activeTab, setActiveTab] = useState<'world' | 'agenda' | 'stopwatch' | 'timer'>('world');

    const tabs = [
        { id: 'world', label: 'World Clock', icon: Globe },
        { id: 'agenda', label: 'Agenda', icon: CalendarDays },
        { id: 'stopwatch', label: 'Stopwatch', icon: StopwatchIcon },
        { id: 'timer', label: 'Timer', icon: Hourglass },
    ];

    const renderContent = (): JSX.Element | null => {
        switch (activeTab) {
            case 'world': return <WorldClock />;
            case 'agenda': return <Agenda events={events} tasks={tasks} classes={classes} />;
            case 'stopwatch': return <Stopwatch />;
            case 'timer': return <Timer />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white">
            <header className="flex-shrink-0 flex justify-center border-b border-white/10">
                <nav className="flex gap-2 p-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as 'world' | 'agenda' | 'stopwatch' | 'timer')} className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            <tab.icon size={16} />{tab.label}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="flex-1 overflow-y-auto">{renderContent()}</main>
        </div>
    );
};

export default Clock;