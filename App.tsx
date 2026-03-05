
import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import MobileTopBar from './components/MobileTopBar';
import MobileAppSwitcher from './components/MobileAppSwitcher';
import MenuBar from './components/MenuBar';
import { appIcons } from './constants';
import Dock from './components/Dock';
import Window from './components/Window';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/Dashboard'));
const TaskList = lazy(() => import('./components/TaskList'));
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer'));
const StudyRoom = lazy(() => import('./components/StudyRoom'));
const ChatBot = lazy(() => import('./components/ChatBot'));
const Settings = lazy(() => import('./components/Settings'));
const ConfirmationModal = lazy(() => import('./components/ConfirmationModal'));
const Calculator = lazy(() => import('./components/Calculator'));
const Notes = lazy(() => import('./components/Notes'));
const Weather = lazy(() => import('./components/Weather'));
const Calendar = lazy(() => import('./components/Calendar'));
const Goals = lazy(() => import('./components/Goals'));
const Music = lazy(() => import('./components/Music'));
const Flashcards = lazy(() => import('./components/Flashcards'));
const Launchpad = lazy(() => import('./components/Launchpad'));

import { AppModule, Project, Task, TimeEntry, ActiveTimer, WindowConfig, Note, Event, Goal, Class, Language, Deck, Flashcard } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import { wallpapers, accentColors } from './config/theme';
import { backupData } from './services/supabaseService';
import { translations } from './utils/translations';
import { LanguageContext } from './contexts/LanguageContext';
import { User } from '@supabase/supabase-js';

const getDefaultWindowSize = (appId: AppModule) => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const MENUBAR_HEIGHT = 28;
  const DOCK_HEIGHT = 64;
  const availableHeight = screenHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;
  const availableWidth = screenWidth;
  
  const paddingX = 100;
  const paddingY = 120;

  switch (appId) {
    case AppModule.CHAT:
      return {
        width: Math.min(450, availableWidth - 40),
        height: Math.min(700, availableHeight - 40),
      };
    case AppModule.CALCULATOR:
      return {
        width: 380,
        height: 600,
      };
    case AppModule.NOTES:
       return {
        width: Math.min(900, availableWidth - paddingX),
        height: Math.min(650, availableHeight - paddingY),
      };
    case AppModule.WEATHER:
      return {
        width: Math.min(500, availableWidth - 40),
        height: Math.min(700, availableHeight - 40),
      };
    case AppModule.CALENDAR:
       return {
        width: Math.min(1000, availableWidth - paddingX),
        height: Math.min(750, availableHeight - paddingY),
      };
    case AppModule.MUSIC:
      return {
        width: 380,
        height: 420,
      };
    case AppModule.POMODORO:
        return {
            width: 480,
            height: 620,
        };
    case AppModule.FLASHCARDS:
        return {
            width: Math.min(900, availableWidth - 80),
            height: Math.min(650, availableHeight - 80),
        };
    case AppModule.SETTINGS:
      return {
        width: Math.min(900, availableWidth - 80),
        height: Math.min(750, availableHeight - 60),
      };
    case AppModule.TASKS:
      return {
        width: Math.min(1100, availableWidth - 40),
        height: Math.min(700, availableHeight - 60),
      };
    default:
      return {
        width: Math.min(800, availableWidth - paddingX),
        height: Math.min(600, availableHeight - paddingY),
      };
  }
};

interface AppProps {
  user: User;
  onRestoreData: (data: Record<string, unknown>) => void;
}

const App: React.FC<AppProps> = ({ user, onRestoreData }) => {
  const [isMobileLayout, setIsMobileLayout] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isDarkMode, setIsDarkMode] = usePersistentState<boolean>('focusflow-theme-dark', true);
  const [accentColor, setAccentColor] = usePersistentState<string>('focusflow-theme-accent', accentColors[0].hex);
  const [wallpaper, setWallpaper] = usePersistentState<string>('focusflow-theme-wallpaper', 'deep_space');
  const [language, setLanguage] = usePersistentState<Language>('focusflow-language', 'en');

  const [windows, setWindows] = usePersistentState<WindowConfig[]>('focusflow-windows', []);
  const [activeWindowId, setActiveWindowId] = useState<AppModule | null>(null);
  const [isClosingWindow, setIsClosingWindow] = useState<AppModule | null>(null);
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const nextZIndex = useRef(10);
  
  const [projects, setProjects] = usePersistentState<Project[]>('focusflow-projects', [
    { id: 'proj-0', name: 'Welcome', color: '#3b82f6' }
  ]);

  const getTomorrow = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
  };

  const [tasks, setTasks] = usePersistentState<Task[]>('focusflow-tasks', [
    { 
        id: 'task-0', 
        title: "Welcome to StudyPro!", 
        completed: false, 
        status: 'todo', 
        projectId: 'proj-0', 
        priority: 1, 
        deadline: getTomorrow(),
        tags: ['studypro'], 
        inMyDay: true,
        subtasks: [
            { id: 'sub-1', title: 'Explore the Unified Productivity Tools', completed: false },
            { id: 'sub-2', title: 'Check the new advanced Sidebar in Tasks', completed: false },
            { id: 'sub-3', title: 'Customize your theme in Settings', completed: false },
        ],
        links: [],
        counters: []
    }
  ]);
  
  useEffect(() => {
      setTasks(prev => prev.map(t => ({
          ...t,
          status: t.status || (t.completed ? 'done' : 'todo'),
          inMyDay: t.inMyDay !== undefined ? t.inMyDay : false,
      })));
  }, [setTasks]); // Only run once on mount to normalize data, setTasks is stable

  const [timeEntries, setTimeEntries] = usePersistentState<TimeEntry[]>('focusflow-timeEntries', []);
  const [activeTimer, setActiveTimer] = usePersistentState<ActiveTimer | null>('focusflow-activeTimer', null);
  const [notes, setNotes] = usePersistentState<Note[]>('focusflow-notes', [{ id: 'note-1', title: 'StudyPro OS', category: 'General', content: '# Welcome\n\nStudyPro is your unified workspace for academic and professional success.\n\n- Tasks: Powerful multi-category organization.\n- Notes: Full Markdown support.\n- AI Assistant: Integrated Gemini power.', createdAt: Date.now() }]);
  const [events, setEvents] = usePersistentState<Event[]>('focusflow-events', []);
  const [goals, setGoals] = usePersistentState<Goal[]>('focusflow-goals', []);
  const [classes, setClasses] = usePersistentState<Class[]>('focusflow-classes', []);
  const [decks, setDecks] = usePersistentState<Deck[]>('focusflow-decks', []);

  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);

  const getAllData = useCallback(() => ({
      projects, tasks, timeEntries, notes, events, goals, classes, decks,
      settings: { isDarkMode, accentColor, wallpaper, language },
      windows,
  }), [projects, tasks, timeEntries, notes, events, goals, classes, decks, isDarkMode, accentColor, wallpaper, windows, language]);

  const backupTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (backupTimerRef.current) clearTimeout(backupTimerRef.current);
    
    backupTimerRef.current = setTimeout(() => {
      backupData(user, getAllData()).catch(err => console.error("Auto-sync failed:", err));
    }, 30000); // 30 seconds debounce for auto-sync

    return () => {
      if (backupTimerRef.current) clearTimeout(backupTimerRef.current);
    };
  }, [getAllData, user]);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const selectedColor = accentColors.find(c => c.hex === accentColor) || { hex: accentColor, hoverHex: accentColor };
    document.documentElement.style.setProperty('--accent-color', selectedColor.hex);
    document.documentElement.style.setProperty('--accent-color-hover', selectedColor.hoverHex);
  }, [accentColor]);

  const currentWallpaper = useMemo(() => wallpapers.find(w => w.id === wallpaper) || wallpapers[0], [wallpaper]);
  const isLiveWallpaper = wallpaper.startsWith('live:');
  const liveVideoId = isLiveWallpaper ? wallpaper.split(':')[1] : null;

  const openWindow = useCallback((appId: AppModule) => {
    setWindows(prev => {
      const existingIndex = prev.findIndex(w => w.id === appId);
      const newZIndex = nextZIndex.current++;
      if (existingIndex !== -1) {
        return prev.map((w, i) => i === existingIndex ? { ...w, isMinimized: false, zIndex: newZIndex } : w);
      }
      
      const { width, height } = getDefaultWindowSize(appId);
      const MENUBAR_HEIGHT = 28;
      const DOCK_HEIGHT = 64;
      const availableHeight = window.innerHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;
      const availableWidth = window.innerWidth;
      
      const x = Math.max(20, Math.min(Math.random() * (availableWidth - width - 40), availableWidth - width - 20));
      const y = Math.max(MENUBAR_HEIGHT + 10, Math.min(Math.random() * (availableHeight - height - 20) + MENUBAR_HEIGHT, availableHeight - height + MENUBAR_HEIGHT - 10));

      return [...prev, {
        id: appId,
        x: x,
        y: y,
        width: width,
        height: height,
        zIndex: newZIndex,
        isMinimized: false,
        isMaximized: false,
      }];
    });
    setActiveWindowId(appId);
  }, [setWindows]);

  const focusWindow = useCallback((appId: AppModule) => {
    const newZIndex = nextZIndex.current++;
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: false, zIndex: newZIndex } : w));
    setActiveWindowId(appId);
  }, [setWindows]);

  const closeWindow = useCallback((appId: AppModule) => {
    setIsClosingWindow(appId);
    setTimeout(() => {
      setWindows(prev => prev.filter(w => w.id !== appId));
      if (activeWindowId === appId) {
        setActiveWindowId(null);
      }
      setIsClosingWindow(null);
    }, 300);
  }, [activeWindowId, setWindows]);

  const minimizeWindow = useCallback((appId: AppModule) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
    if (activeWindowId === appId) setActiveWindowId(null);
  }, [activeWindowId, setWindows]);
  
  const toggleMaximize = useCallback((appId: AppModule) => {
    setWindows(prev => prev.map(w => {
        if (w.id === appId) {
            if (w.isMaximized) {
                return { ...w, isMaximized: false, ...w.preMaximizeState };
            } else {
                return { ...w, isMaximized: true, preMaximizeState: { x: w.x, y: w.y, width: w.width, height: w.height }};
            }
        }
        return w;
    }));
  }, [setWindows]);

  const tileWindows = useCallback(() => {
    const visibleWindows = windows.filter(w => !w.isMinimized);
    const count = visibleWindows.length;
    if (count === 0) return;

    const MENUBAR_HEIGHT = 28;
    const DOCK_HEIGHT = 64;
    const availableHeight = window.innerHeight - MENUBAR_HEIGHT - DOCK_HEIGHT;
    const availableWidth = window.innerWidth;

    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const width = availableWidth / cols;
    const height = availableHeight / rows;

    setWindows(prev => prev.map(w => {
      if (w.isMinimized) return w;
      const index = visibleWindows.findIndex(vw => vw.id === w.id);
      if (index === -1) return w;

      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...w,
        x: col * width,
        y: MENUBAR_HEIGHT + (row * height),
        width: width,
        height: height,
        isMaximized: false
      };
    }));
  }, [windows, setWindows]);

  const updateWindowState = useCallback((appId: AppModule, updates: Partial<WindowConfig>) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, ...updates } : w));
  }, [setWindows]);

  useEffect(() => {
    if (isMobileLayout && !activeWindowId) {
       openWindow(AppModule.DASHBOARD);
    }
  }, [isMobileLayout, activeWindowId, openWindow]);
  
  const handleCloseAll = () => setWindows([]);

  const handleStartTimer = (description: string, project: string) => setActiveTimer({ startTime: Date.now(), description, project });
  const handleStopTimer = () => {
    if (!activeTimer) return;
    const endTime = Date.now();
    const newEntry: TimeEntry = {
      id: `time-${endTime}`,
      description: activeTimer.description,
      startTime: activeTimer.startTime,
      endTime,
      duration: Math.floor((endTime - activeTimer.startTime) / 1000),
      project: activeTimer.project,
    };
    setTimeEntries(prev => [newEntry, ...prev]);
    setActiveTimer(null);
  };
  const handleAddNote = (category: string) => {
    const newNote: Note = { id: `note-${Date.now()}`, title: 'New Note', content: '', category, createdAt: Date.now() };
    setNotes(prev => [newNote, ...prev]);
  };
  const handleUpdateNote = (id: string, updates: Partial<Note>) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  const handleDeleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));
  const handleAddEvent = (event: Omit<Event, 'id'>) => setEvents(prev => [...prev, { ...event, id: `event-${Date.now()}` }]);
  const handleDeleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
  const handleAddGoal = (goal: Omit<Goal, 'id'>) => setGoals(prev => [...prev, { ...goal, id: `goal-${Date.now()}` }]);
  
  const handleToggleGoal = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setGoals(prev => prev.map(g => {
        if (g.id === id) {
            const completedToday = g.completedDates.includes(today);
            const newCompletedDates = completedToday 
                ? g.completedDates.filter(d => d !== today)
                : [...g.completedDates, today];
            
            return {
                ...g,
                completedDates: newCompletedDates,
                streak: completedToday ? Math.max(0, g.streak - 1) : g.streak + 1
            }
        }
        return g;
    }));
  };

  const handleDeleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const handleAddClass = (cls: Class) => setClasses(prev => [...prev, cls]);
  const handleDeleteClass = (id: string) => setClasses(prev => prev.filter(c => c.id !== id));
  
  const handleAddDeck = (title: string) => setDecks(prev => [...prev, { id: `deck-${Date.now()}`, title, cards: [] }]);
  const handleDeleteDeck = (id: string) => setDecks(prev => prev.filter(d => d.id !== id));
  const handleAddCard = (deckId: string, front: string, back: string) => {
      setDecks(prev => prev.map(d => d.id === deckId ? {
          ...d,
          cards: [...d.cards, { id: `card-${Date.now()}`, front, back, box: 0, nextReview: Date.now() }]
      } : d));
  };
  const handleUpdateCard = (deckId: string, cardId: string, updates: Partial<Flashcard>) => {
      setDecks(prev => prev.map(d => d.id === deckId ? {
          ...d,
          cards: d.cards.map(c => c.id === cardId ? { ...c, ...updates } : c)
      } : d));
  };
  const handleDeleteCard = (deckId: string, cardId: string) => {
      setDecks(prev => prev.map(d => d.id === deckId ? {
          ...d,
          cards: d.cards.filter(c => c.id !== cardId)
      } : d));
  };


  const handleExportData = () => {
      const allData = getAllData();
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studypro_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleImportData = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const data = JSON.parse(e.target?.result as string) as Record<string, unknown>;
              onRestoreData(data);
              alert('Data imported successfully!');
          } catch (err) {
              console.error('Import failed:', err);
              alert('Failed to import data. Please check the file format.');
          }
      };
      reader.readAsText(file);
  };

  const handleWipeData = () => {
      localStorage.clear();
      window.location.reload();
  };
  
  const handleAiAction = (functionName: string, args: Record<string, unknown>) => {
    switch (functionName) {
      case 'addTask': {
        const title = typeof args.title === 'string' ? args.title : 'New Task';
        const projectName = typeof args.projectName === 'string' ? args.projectName : undefined;
        const deadline = typeof args.deadline === 'string' ? args.deadline : undefined;
        
        let projectId = projects[0]?.id || 'proj-0';
        if (projectName) {
          const foundProject = projects.find(p => p.name.toLowerCase().includes(projectName.toLowerCase()));
          if (foundProject) {
            projectId = foundProject.id;
          }
        }
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: title,
          completed: false,
          status: 'todo',
          projectId: projectId,
          priority: 4,
          tags: ['AI'],
          deadline: deadline,
        };
        setTasks(prev => [newTask, ...prev]);
        break;
      }
      case 'updateTask': {
        const oldTitle = typeof args.oldTitle === 'string' ? args.oldTitle : '';
        const newTitle = typeof args.newTitle === 'string' ? args.newTitle : undefined;
        const completed = typeof args.completed === 'boolean' ? args.completed : undefined;

        setTasks(prev => prev.map(t => {
            if (oldTitle && t.title.toLowerCase().includes(oldTitle.toLowerCase())) {
                return {
                    ...t,
                    title: newTitle || t.title,
                    completed: completed !== undefined ? completed : t.completed,
                    status: completed ? 'done' : (completed === false ? 'in_progress' : t.status)
                };
            }
            return t;
        }));
        break;
      }
      case 'deleteTask': {
        const title = typeof args.title === 'string' ? args.title : '';
        if (title) {
          setTasks(prev => prev.filter(t => !t.title.toLowerCase().includes(title.toLowerCase())));
        }
        break;
      }
      case 'addEvent': {
        const title = typeof args.title === 'string' ? args.title : 'New Event';
        const date = typeof args.date === 'string' ? args.date : new Date().toISOString().split('T')[0];
        const startTime = typeof args.startTime === 'string' ? args.startTime : undefined;
        const endTime = typeof args.endTime === 'string' ? args.endTime : undefined;

        const newEvent: Omit<Event, 'id'> = {
          title,
          date,
          startTime,
          endTime,
          color: accentColors[Math.floor(Math.random() * accentColors.length)].hex,
        };
        handleAddEvent(newEvent);
        break;
      }
      case 'addNote': {
        const title = typeof args.title === 'string' ? args.title : 'New Note';
        const content = typeof args.content === 'string' ? args.content : '';
        const category = typeof args.category === 'string' ? args.category : 'General';
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title,
          content,
          category,
          createdAt: Date.now(),
        };
        setNotes(prev => [newNote, ...prev]);
        break;
      }
      case 'addGoal': {
        const title = typeof args.title === 'string' ? args.title : 'New Goal';
        const icon = typeof args.icon === 'string' ? args.icon : '🎯';
        const color = typeof args.color === 'string' ? args.color : accentColors[Math.floor(Math.random() * accentColors.length)].hex;
        const newGoal: Omit<Goal, 'id'> = {
          title,
          icon,
          color,
          streak: 0,
          completedDates: [],
          targetDaysPerWeek: 7,
        };
        handleAddGoal(newGoal);
        break;
      }
      case 'addFlashcard': {
        const deckTitle = typeof args.deckTitle === 'string' ? args.deckTitle : 'General';
        const front = typeof args.front === 'string' ? args.front : '';
        const back = typeof args.back === 'string' ? args.back : '';

        let deck = decks.find(d => d.title.toLowerCase().includes(deckTitle.toLowerCase()));
        if (!deck) {
          // Create deck if not found
          const newDeckId = `deck-${Date.now()}`;
          const newDeck: Deck = { id: newDeckId, title: deckTitle, cards: [] };
          setDecks(prev => [...prev, newDeck]);
          deck = newDeck;
        }
        handleAddCard(deck.id, front, back);
        break;
      }
      default:
        console.warn(`Unknown AI action: ${functionName}`);
    }
  };

  const t = (key: string) => {
    const lang = language as string;
    const k = key as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dict = (translations as any)[lang] || translations['en'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (dict as any)[k] || (translations['en'] as any)[k] || key;
  };

  const renderAppModule = (appId: AppModule) => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-full w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      }>
        {(() => {
          switch (appId) {
            case AppModule.DASHBOARD: return <Dashboard tasks={tasks} projects={projects} setProjects={setProjects} timeEntries={timeEntries} events={events} classes={classes} goals={goals} />;
            case AppModule.TASKS: return <TaskList tasks={tasks} projects={projects} setTasks={setTasks} setProjects={setProjects} />;
            case AppModule.POMODORO: return <PomodoroTimer timeEntries={timeEntries} activeTimer={activeTimer} onStartTimer={handleStartTimer} onStopTimer={handleStopTimer} />;
            case AppModule.SOCIAL: return <StudyRoom />;
            case AppModule.CHAT: return <ChatBot projects={projects} onAiAction={handleAiAction} />;
            case AppModule.SETTINGS: return <Settings onExportData={handleExportData} onImportData={handleImportData} onWipeData={() => setIsWipeModalOpen(true)} getAllData={getAllData} onRestoreData={onRestoreData} user={user} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(p => !p)} accentColor={accentColor} onSetAccentColor={setAccentColor} wallpaper={wallpaper} onSetWallpaper={setWallpaper} />;
            case AppModule.CALCULATOR: return <Calculator />;
            case AppModule.NOTES: return <Notes notes={notes} onAddNote={handleAddNote} onUpdateNote={handleUpdateNote} onDeleteNote={handleDeleteNote} />;
            case AppModule.WEATHER: return <Weather />;
            case AppModule.CALENDAR: return <Calendar events={events} tasks={tasks} classes={classes} onAddEvent={handleAddEvent} onDeleteEvent={handleDeleteEvent} onAddClass={handleAddClass} onDeleteClass={handleDeleteClass} />;
            case AppModule.GOALS: return <Goals goals={goals} onAddGoal={handleAddGoal} onToggleGoal={handleToggleGoal} onDeleteGoal={handleDeleteGoal} />;
            case AppModule.MUSIC: return <Music />;
            case AppModule.FLASHCARDS: return <Flashcards decks={decks} onAddDeck={handleAddDeck} onDeleteDeck={handleDeleteDeck} onAddCard={handleAddCard} onUpdateCard={handleUpdateCard} onDeleteCard={handleDeleteCard} />;
            default: return null;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
        <div
        className="h-screen w-screen bg-cover bg-center transition-all duration-500 font-sans overflow-hidden relative"
        style={!isLiveWallpaper ? { backgroundImage: `url(${isDarkMode ? currentWallpaper.darkUrl : currentWallpaper.lightUrl})` } : {}}
        >
        {isLiveWallpaper && liveVideoId && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <iframe
                    className="absolute top-1/2 left-1/2 w-[177.777vh] h-[56.25vw] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                    src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${liveVideoId}&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0&playsinline=1`}
                    title="Live Wallpaper"
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
            </div>
        )}

        {isMobileLayout ? (
          <div className="flex flex-col h-full w-full">
            <MobileTopBar
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(p => !p)}
              onOpenPreferences={() => openWindow(AppModule.SETTINGS)}
            />
            <main className="flex-1 overflow-hidden relative">
              {activeWindowId ? (
                <div className="absolute inset-0 w-full h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md overflow-hidden">
                   {renderAppModule(activeWindowId)}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full text-gray-500">
                  {t('noAppOpen')}
                </div>
              )}
            </main>
            <MobileAppSwitcher
              openWindows={windows}
              onLaunch={openWindow}
              onFocus={focusWindow}
              t={t}
            />
          </div>
        ) : (
          <>
            <MenuBar
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(p => !p)}
              onNewTask={() => openWindow(AppModule.TASKS)}
              onOpenPreferences={() => openWindow(AppModule.SETTINGS)}
              onCloseWindow={activeWindowId ? () => closeWindow(activeWindowId) : () => {}}
              onMinimizeWindow={activeWindowId ? () => minimizeWindow(activeWindowId) : () => {}}
              onToggleMaximize={activeWindowId ? () => toggleMaximize(activeWindowId) : () => {}}
              onCloseAll={handleCloseAll}
              onTileWindows={tileWindows}
              windows={windows}
              activeWindowId={activeWindowId}
              onFocusWindow={focusWindow}
            />

            <main className="h-full w-full">
              <div className="relative h-full w-full">
                {windows.map(config => (
                  <Window
                    key={config.id}
                    config={{ ...config, isClosing: isClosingWindow === config.id }}
                    onClose={() => closeWindow(config.id)}
                    onMinimize={() => minimizeWindow(config.id)}
                    onToggleMaximize={() => toggleMaximize(config.id)}
                    onFocus={() => focusWindow(config.id)}
                    onUpdate={(updates) => updateWindowState(config.id, updates)}
                  >
                    {renderAppModule(config.id)}
                  </Window>
                ))}
            </div>
        </main>



        <Dock
            openWindows={windows}
            onLaunch={openWindow}
            onFocus={focusWindow}
            onToggleLaunchpad={() => setIsLaunchpadOpen(p => !p)}
        />

        {isLaunchpadOpen && (
            <Launchpad 
                onLaunch={openWindow} 
                onClose={() => setIsLaunchpadOpen(false)}
                appIcons={appIcons}
                appNames={Object.fromEntries(Object.values(AppModule).map(id => [id, t(id.toLowerCase() as keyof typeof translations['en'])]))}
            />
        )}
        
        <ConfirmationModal
            isOpen={isWipeModalOpen}
            onClose={() => setIsWipeModalOpen(false)}
            onConfirm={handleWipeData}
            title={t('wipeData')}
            message={t('wipeDataConfirm')}
            confirmText={t('wipeData')}
        />
          </>
        )}
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
