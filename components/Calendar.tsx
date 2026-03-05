import React, { useState, useContext, useEffect, useRef } from 'react';
import { Event, Task, Class } from '../types';
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckSquare, GraduationCap, Calendar as CalendarIcon, Globe, Hourglass, Play, Pause, RotateCcw, Flag, Sparkles, X, Loader2 } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { parseEventFromText } from '../services/geminiService';
import ClassSchedule from './ClassSchedule';

// --- CLOCK COMPONENTS ---

const cities = [
  { name: 'New York', timeZone: 'America/New_York' },
  { name: 'London', timeZone: 'Europe/London' },
  { name: 'Tokyo', timeZone: 'Asia/Tokyo' },
  { name: 'Sydney', timeZone: 'Australia/Sydney' },
];

const WorldClock = (): JSX.Element => {
  const { t, language } = useContext(LanguageContext);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval((): void => setTime(new Date()), 1000);
    return (): void => clearInterval(timerId);
  }, []);

  const formatTime = (date: Date, timeZone: string): string => date.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDate = (date: Date, timeZone: string): string => date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { timeZone, weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 space-y-6 animate-fade-in h-full overflow-y-auto">
      <div>
        <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">{t('localTime')}</h3>
        <p className="text-5xl font-bold font-mono tracking-tighter text-slate-900 dark:text-white">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
        <p className="text-slate-500 dark:text-slate-300 text-lg">{time.toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {cities.map(city => (
          <div key={city.name} className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <div>
              <p className="font-bold">{city.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(time, city.timeZone)}</p>
            </div>
            <p className="text-2xl font-mono font-bold text-[var(--accent-color)]">{formatTime(time, city.timeZone)}</p>
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
    const { t } = useContext(LanguageContext);
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
        <div className="p-6 flex flex-col h-full items-center justify-center animate-fade-in">
            <div className="flex-1 flex items-center justify-center">
                <p className="text-6xl font-mono font-bold tracking-tighter text-slate-900 dark:text-white">{formatStopwatchTime(time)}</p>
            </div>
            <div className="flex justify-center gap-4 mb-6">
                <button onClick={handleReset} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><RotateCcw size={20} /></button>
                <button onClick={handleStartStop} className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-colors shadow-lg`}>
                    {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <button onClick={handleLap} disabled={!isRunning} className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-900 dark:text-white disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><Flag size={20} /></button>
            </div>
            <div className="h-40 w-full overflow-y-auto bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 space-y-2">
                {laps.map((lap, i) => (
                    <div key={i} className="flex justify-between p-2 text-sm font-mono rounded bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                        <span>{t('lap')} {laps.length - i}</span>
                        <span>{formatStopwatchTime(lap - (laps[i+1] || 0) )}</span>
                        <span>{formatStopwatchTime(lap)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Timer = (): JSX.Element => {
    const { t } = useContext(LanguageContext);
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
        const { h, m, s } = formatTimeParts(duration);
        let newDuration;
        if (unit === 'h') newDuration = value * 3600 + m * 60 + s;
        else if (unit === 'm') newDuration = h * 3600 + value * 60 + s;
        else newDuration = h * 3600 + m * 60 + value;
        
        setDuration(newDuration);
        if(!isActive) setTimeLeft(newDuration);
    };
    
    const formatTimeParts = (s: number): { h: number; m: number; s: number } => ({ h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    const {h, m, s} = formatTimeParts(timeLeft);
    const progress = duration > 0 ? timeLeft / duration : 0;
    const circumference = 2 * Math.PI * 100;
    const dashoffset = circumference * (1 - progress);

    return (
        <div className="p-6 flex flex-col h-full items-center justify-center gap-8 animate-fade-in">
            <div className="relative">
                <svg width="220" height="220" className="-rotate-90">
                    <circle cx="110" cy="110" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                    <circle cx="110" cy="110" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-linear text-[var(--accent-color)]" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><div className="text-4xl font-bold text-slate-900 dark:text-white font-mono">{`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}</div></div>
            </div>
            
            <div className="flex gap-2 items-center font-mono text-xl">
                 <div className="flex flex-col items-center">
                    <input type="number" min="0" max="23" value={formatTimeParts(duration).h} onChange={e => handleDurationChange(e, 'h')} disabled={isActive} className="w-16 bg-slate-100 dark:bg-slate-800 text-center rounded-lg p-2 focus:ring-2 focus:ring-[var(--accent-color)]" />
                    <span className="text-xs text-slate-500 mt-1">{t('hr')}</span>
                 </div>
                 <span className="mb-4">:</span>
                 <div className="flex flex-col items-center">
                    <input type="number" min="0" max="59" value={formatTimeParts(duration).m} onChange={e => handleDurationChange(e, 'm')} disabled={isActive} className="w-16 bg-slate-100 dark:bg-slate-800 text-center rounded-lg p-2 focus:ring-2 focus:ring-[var(--accent-color)]" />
                    <span className="text-xs text-slate-500 mt-1">{t('min')}</span>
                 </div>
                 <span className="mb-4">:</span>
                 <div className="flex flex-col items-center">
                    <input type="number" min="0" max="59" value={formatTimeParts(duration).s} onChange={e => handleDurationChange(e, 's')} disabled={isActive} className="w-16 bg-slate-100 dark:bg-slate-800 text-center rounded-lg p-2 focus:ring-2 focus:ring-[var(--accent-color)]" />
                    <span className="text-xs text-slate-500 mt-1">{t('sec')}</span>
                 </div>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={() => { setIsActive(false); setTimeLeft(duration); }} className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><RotateCcw size={20} /></button>
                <button onClick={() => setIsActive(p => !p)} className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[var(--accent-color)] hover:brightness-110'} shadow-lg transition-colors`}>{isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}</button>
            </div>
        </div>
    );
};

// --- CALENDAR COMPONENTS ---

interface CalendarProps {
  events: Event[];
  tasks: Task[];
  classes: Class[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onAddClass: (cls: Class) => void;
  onDeleteClass: (id: string) => void;
}

const CalendarView: React.FC<Pick<CalendarProps, 'events' | 'tasks' | 'classes' | 'onAddEvent' | 'onDeleteEvent'>> = ({ events, tasks, classes, onAddEvent, onDeleteEvent }): JSX.Element => {
    const { t, language } = useContext(LanguageContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [quickAddText, setQuickAddText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Calendar Generation
    const getDaysInMonth = (date: Date): { days: number; firstDay: number } => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const daysArray = Array.from({ length: 42 }, (_, i) => {
        const dayNumber = i - firstDay + 1;
        if (dayNumber > 0 && dayNumber <= days) return dayNumber;
        return null;
    });

    const prevMonth = (): void => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = (): void => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleQuickAdd = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!quickAddText.trim()) return;
        setIsProcessing(true);
        try {
            const result = await parseEventFromText(quickAddText);
            const todayStr = new Date().toISOString().split('T')[0];
            const eventDate = result.date || todayStr;
            
            onAddEvent({
                title: result.title || quickAddText,
                date: eventDate,
                startTime: result.startTime,
                endTime: result.endTime,
                color: '#3b82f6', // Default blue
            });
            setQuickAddText('');
            setIsAddEventOpen(false);
            // If date is different, jump to it
            if (eventDate) {
                const newDate = new Date(eventDate);
                setCurrentDate(newDate);
                setSelectedDate(newDate);
            }
        } catch (error) {
            console.error("Failed to parse event", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    // Items for Selected Date
    const dayEvents = events.filter(e => e.date === selectedDateStr);
    const dayTasks = tasks.filter(t => t.deadline === selectedDateStr);
    const dayOfWeek = selectedDate.getDay();
    const dayClasses = classes.flatMap(c => 
        c.sessions.filter(s => s.dayOfWeek === dayOfWeek).map(s => ({ ...c, session: s }))
    );

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
            <div className="flex-1 flex flex-col p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {currentDate.toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"><ChevronLeft size={20}/></button>
                        <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }} className="px-3 py-1 text-sm bg-gray-200 dark:bg-slate-700 rounded-lg font-medium">{t('today')}</button>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"><ChevronRight size={20}/></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-gray-400 uppercase">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 flex-1 gap-1">
                    {daysArray.map((day, i) => {
                        if (!day) return <div key={i} className="bg-transparent"></div>;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dateStr = date.toISOString().split('T')[0];
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        const isSelected = dateStr === selectedDateStr;
                        
                        // Indicators
                        const hasEvent = events.some(e => e.date === dateStr);
                        const hasTask = tasks.some(t => t.deadline === dateStr && !t.completed);
                        const hasClass = classes.some(c => c.sessions.some(s => s.dayOfWeek === date.getDay()));

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(date)}
                                className={`
                                    relative flex flex-col items-center justify-start pt-2 rounded-lg transition-colors
                                    ${isSelected ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-800'}
                                    ${isToday && !isSelected ? 'ring-2 ring-[var(--accent-color)]' : ''}
                                `}
                            >
                                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                                <div className="flex gap-1 mt-1">
                                    {hasEvent && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>}
                                    {hasTask && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500'}`}></div>}
                                    {hasClass && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`}></div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="w-80 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-950">
                    <div>
                        <h3 className="font-bold">{selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { weekday: 'long' })}</h3>
                        <p className="text-xs text-gray-500">{selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { month: 'long', day: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setIsAddEventOpen(true)} className="p-2 bg-[var(--accent-color)] text-white rounded-lg shadow-sm hover:brightness-110"><Plus size={18}/></button>
                </div>
                
                {isAddEventOpen && (
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 animate-fade-in">
                        <form onSubmit={handleQuickAdd}>
                            <div className="flex gap-2">
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={quickAddText}
                                    onChange={e => setQuickAddText(e.target.value)}
                                    placeholder={t('addEventPlaceholder')}
                                    className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                />
                                <button type="button" onClick={() => setIsAddEventOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-gray-400 flex items-center gap-1"><Sparkles size={10}/> {t('aiPowered')}</span>
                                <button type="submit" disabled={isProcessing || !quickAddText} className="text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded font-bold disabled:opacity-50">
                                    {isProcessing ? <Loader2 size={12} className="animate-spin"/> : t('add')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Events */}
                    {dayEvents.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><CalendarIcon size={12}/> {t('events')}</h4>
                            <div className="space-y-2">
                                {dayEvents.map(e => (
                                    <div key={e.id} className="flex gap-3 items-start group">
                                        <div className="w-1 h-full min-h-[2rem] rounded-full bg-blue-500"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium leading-tight">{e.title}</p>
                                            {(e.startTime || e.endTime) && <p className="text-xs text-gray-500">{e.startTime} - {e.endTime}</p>}
                                        </div>
                                        <button onClick={() => onDeleteEvent(e.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Classes */}
                    {dayClasses.length > 0 && (
                         <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><GraduationCap size={12}/> {t('classes')}</h4>
                            <div className="space-y-2">
                                {dayClasses.map((c, i) => (
                                    <div key={i} className="flex gap-3 items-start p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                        <div className="w-1 h-full min-h-[2rem] rounded-full" style={{ backgroundColor: c.color }}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 dark:text-purple-100 leading-tight">{c.name}</p>
                                            <p className="text-xs text-purple-600 dark:text-purple-300 mt-0.5">{c.session.startTime} - {c.session.endTime} • {c.location}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tasks */}
                    {dayTasks.length > 0 && (
                         <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><CheckSquare size={12}/> {t('dueToday')}</h4>
                            <div className="space-y-2">
                                {dayTasks.map(t => (
                                    <div key={t.id} className="flex gap-2 items-center p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${t.completed ? 'bg-orange-500 border-orange-500' : 'border-orange-300'}`}>
                                            {t.completed && <CheckSquare size={10} className="text-white"/>}
                                        </div>
                                        <span className={`text-sm ${t.completed ? 'line-through text-gray-400' : 'text-slate-800 dark:text-orange-100'}`}>{t.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {dayEvents.length === 0 && dayTasks.length === 0 && dayClasses.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <Sparkles size={32} className="mx-auto mb-2 opacity-20"/>
                            <p className="text-sm">{t('nothingScheduled')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const Calendar: React.FC<CalendarProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'clock' | 'tools'>('calendar');
    const { t } = useContext(LanguageContext);

    const tabs = [
        { id: 'calendar', label: t('calendar'), icon: CalendarIcon },
        { id: 'schedule', label: t('classes'), icon: GraduationCap },
        { id: 'clock', label: t('worldClock'), icon: Globe },
        { id: 'tools', label: t('utilities'), icon: Hourglass },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
            <header className="flex-shrink-0 flex justify-center border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <nav className="flex gap-1 p-1">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as 'calendar' | 'schedule' | 'clock' | 'tools')} 
                            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                        >
                            <tab.icon size={16} />{tab.label}
                        </button>
                    ))}
                </nav>
            </header>
            <main className="flex-1 overflow-hidden relative">
                {activeTab === 'calendar' && <CalendarView {...props} />}
                {activeTab === 'schedule' && <ClassSchedule classes={props.classes} onAddClass={props.onAddClass} onDeleteClass={props.onDeleteClass} />}
                {activeTab === 'clock' && <WorldClock />}
                {activeTab === 'tools' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 dark:bg-slate-800 h-full">
                        <div className="bg-white dark:bg-slate-900 h-full"><Stopwatch /></div>
                        <div className="bg-white dark:bg-slate-900 h-full"><Timer /></div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Calendar;