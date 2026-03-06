import React from 'react';
import { AppModule, WindowConfig } from '../../types';
import { Home, ListTodo, Timer, MessageSquare, Settings, Calculator, Notebook, Cloud, Calendar, Target, Music, BookText } from 'lucide-react';

interface MobileAppSwitcherProps {
  openWindows: WindowConfig[];
  onLaunch: (appId: AppModule) => void;
  onFocus: (appId: AppModule) => void;
  t: (key: string) => string;
}

const appIcons: Record<AppModule, React.ReactNode> = {
  [AppModule.DASHBOARD]: <Home size={20} />,
  [AppModule.TASKS]: <ListTodo size={20} />,
  [AppModule.POMODORO]: <Timer size={20} />,
  [AppModule.SOCIAL]: <Cloud size={20} />,
  [AppModule.CHAT]: <MessageSquare size={20} />,
  [AppModule.SETTINGS]: <Settings size={20} />,
  [AppModule.CALCULATOR]: <Calculator size={20} />,
  [AppModule.NOTES]: <Notebook size={20} />,
  [AppModule.WEATHER]: <Cloud size={20} />,
  [AppModule.CALENDAR]: <Calendar size={20} />,
  [AppModule.GOALS]: <Target size={20} />,
  [AppModule.MUSIC]: <Music size={20} />,
  [AppModule.FLASHCARDS]: <BookText size={20} />,
};

const MobileAppSwitcher: React.FC<MobileAppSwitcherProps> = ({
  openWindows,
  onLaunch,
  onFocus,
  t,
}) => {
  const availableApps = [
    AppModule.DASHBOARD,
    AppModule.TASKS,
    AppModule.POMODORO,
    AppModule.CHAT,
    AppModule.NOTES,
    AppModule.CALENDAR,
    AppModule.SETTINGS,
  ];

  return (
    <div className="flex justify-around items-center w-full h-16 bg-white/80 backdrop-blur-lg border-t border-gray-200 dark:bg-black/80 dark:border-gray-800 shadow-lg">
      {availableApps.map((appId) => {
        const isOpen = openWindows.some((win) => win.id === appId);
        const appName = t(appId.toLowerCase());

        return (
          <button
            key={appId}
            onClick={() => (isOpen ? onFocus(appId) : onLaunch(appId))}
            className={`flex flex-col items-center text-xs font-medium transition-colors ${isOpen ? 'text-accent-color' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {appIcons[appId]}
            <span className="mt-1">{appName}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileAppSwitcher;
