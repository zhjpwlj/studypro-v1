import React from 'react';
import { Clock, Settings, Sun, Moon } from 'lucide-react';

interface MobileTopBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenPreferences: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onOpenPreferences,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between w-full h-12 px-4 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-black/80 dark:border-gray-800 text-gray-800 dark:text-gray-200 shadow-sm">
      <div className="flex items-center space-x-2">
        <Clock size={18} />
        <span className="font-medium text-sm">{currentTime}</span>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={onToggleDarkMode} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={onOpenPreferences} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
