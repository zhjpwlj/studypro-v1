
import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import MobileTopBar from './components/layout/MobileTopBar';
import MobileAppSwitcher from './components/ui/MobileAppSwitcher';
import MenuBar from './components/layout/MenuBar';
import { appIcons } from './constants';
import Dock from './components/layout/Dock';
import Window from './components/layout/Window';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/features/Dashboard'));
const TaskList = lazy(() => import('./components/features/TaskList'));
const PomodoroTimer = lazy(() => import('./components/features/PomodoroTimer'));
const StudyRoom = lazy(() => import('./components/features/StudyRoom'));
const ChatBot = lazy(() => import('./components/features/ChatBot'));
const Settings = lazy(() => import('./components/features/Settings'));
const ConfirmationModal = lazy(() => import('./components/ui/ConfirmationModal'));
const Calculator = lazy(() => import('./components/features/Calculator'));
const Notes = lazy(() => import('./components/features/Notes'));
const Weather = lazy(() => import('./components/features/Weather'));
const Calendar = lazy(() => import('./components/features/Calendar'));
const Goals = lazy(() => import('./components/features/Goals'));
const Music = lazy(() => import('./components/features/Music'));
const Flashcards = lazy(() => import('./components/features/Flashcards'));
const Launchpad = lazy(() => import('./components/features/Launchpad'));

import { AppModule, Project, Task, TimeEntry, ActiveTimer, WindowConfig, Note, Event, Goal, Class, Language, Deck, Flashcard } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import { wallpapers, accentColors } from './config/theme';
import { backupData } from './services/supabaseService';
import { translations } from './utils/translations';
import { LanguageContext } from './contexts/LanguageContext';
import { User } from '@supabase/supabase-js';

import { useWindowManager } from './hooks/useWindowManager';
import { useAppData } from './hooks/useAppData';

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

  const {
    windows, setWindows, activeWindowId, setActiveWindowId, isClosingWindow,
    openWindow, focusWindow, closeWindow, minimizeWindow, toggleMaximize,
    tileWindows, closeAllWindows
  } = useWindowManager();

  const {
    projects, setProjects, tasks, setTasks, timeEntries, setTimeEntries,
    activeTimer, setActiveTimer, notes, setNotes, events, setEvents,
    goals, setGoals, classes, setClasses, decks, setDecks
  } = useAppData();

  const [isDarkMode, setIsDarkMode] = usePersistentState<boolean>('focusflow-theme-dark', true);
  const [accentColor, setAccentColor] = usePersistentState<string>('focusflow-theme-accent', accentColors[0].hex);
  const [wallpaper, setWallpaper] = usePersistentState<string>('focusflow-theme-wallpaper', 'deep_space');
  const [language, setLanguage] = usePersistentState<Language>('focusflow-language', 'en');

  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);

  const {
    handleStartTimer, handleStopTimer, handleAddNote, handleUpdateNote, handleDeleteNote,
    handleAddEvent, handleDeleteEvent, handleAddGoal, handleToggleGoal, handleDeleteGoal,
    handleAddClass, handleDeleteClass, handleAddDeck, handleDeleteDeck, handleAddCard,
    handleUpdateCard, handleDeleteCard, handleAiAction
  } = useAppActions({
    projects, setProjects, tasks, setTasks, timeEntries, setTimeEntries,
    activeTimer, setActiveTimer, notes, setNotes, events, setEvents,
    goals, setGoals, classes, setClasses, decks, setDecks, setWindows,
    onRestoreData, accentColors
  });

  const updateWindowState = useCallback((appId: AppModule, updates: Partial<WindowConfig>) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, ...updates } : w));
  }, [setWindows]);

  useEffect(() => {
    if (isMobileLayout && !activeWindowId) {
       openWindow(AppModule.DASHBOARD);
    }
  }, [isMobileLayout, activeWindowId, openWindow]);
  
  const handleCloseAll = () => setWindows([]);

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
  
  const t = (key: string): string => {
    const lang = language as keyof typeof translations;
    const dict = translations[lang] || translations['en'];
    return (dict as Record<string, string>)[key] || (translations['en'] as Record<string, string>)[key] || key;
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
