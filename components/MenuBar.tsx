
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Sun, Moon, Wifi, Check } from 'lucide-react';
import { WindowConfig, AppModule } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

interface MenuBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNewTask: () => void;
  onOpenPreferences: () => void;
  onCloseWindow: () => void;
  onMinimizeWindow: () => void;
  onToggleMaximize: () => void;
  onCloseAll: () => void;
  onTileWindows: () => void;
  windows: WindowConfig[];
  activeWindowId: AppModule | null;
  onFocusWindow: (appId: AppModule) => void;
}

const getTitle = (id: AppModule, t: (key: keyof typeof translations['en']) => string): string => {
  return t(id.toLowerCase() as keyof typeof translations['en']);
};

const MenuItem: React.FC<{ onClick?: () => void, disabled?: boolean, children: React.ReactNode, shortcut?: string }> = ({ onClick, disabled, children, shortcut }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left px-3 py-1.5 flex justify-between items-center text-sm hover:bg-[var(--accent-color)] hover:text-white rounded-md disabled:opacity-50 disabled:bg-transparent disabled:text-inherit transition-colors"
    >
        <span>{children}</span>
        {shortcut && <span className="text-xs opacity-60 ml-4">{shortcut}</span>}
    </button>
);

const MenuBar: React.FC<MenuBarProps> = (props) => {
  const [time, setTime] = useState(new Date());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenu(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(timer);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (menu: string): void => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  
  const handleItemClick = (action?: () => void): void => {
      action?.();
      setOpenMenu(null);
  }

  const formatTime = (date: Date): string => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formatDate = (date: Date): string => date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const { isDarkMode, onToggleDarkMode, onNewTask, onOpenPreferences, onCloseWindow, onMinimizeWindow, onToggleMaximize, onCloseAll, onTileWindows, windows, activeWindowId, onFocusWindow } = props;
  const hasActiveWindow = !!activeWindowId;

  const menus = {
      'StudyPro': [
          { label: t('about'), disabled: true },
          'divider',
          { label: t('preferences'), action: onOpenPreferences, shortcut: '⌘,' },
      ],
      [t('file')]: [
          { label: t('newTask'), action: onNewTask, shortcut: '⌘N' },
          { label: t('closeAll'), action: onCloseAll, disabled: windows.length === 0, shortcut: '⌥⌘W' },
      ],
      [t('edit')]: [ { label: t('undo'), disabled: true }, { label: t('redo'), disabled: true }, { label: t('copy'), disabled: true } ],
      [t('view')]: [
          { label: t('toggleDarkMode'), action: onToggleDarkMode, shortcut: '⌘T' },
      ],
      [t('window')]: [
          { label: t('minimize'), action: onMinimizeWindow, disabled: !hasActiveWindow, shortcut: '⌘M' },
          { label: t('zoom'), action: onToggleMaximize, disabled: !hasActiveWindow },
          { label: t('tileWindows'), action: onTileWindows, disabled: windows.length === 0 },
          { label: t('close'), action: onCloseWindow, disabled: !hasActiveWindow, shortcut: '⌘W' },
          'divider',
          ...windows.map(w => ({ label: getTitle(w.id, t), action: () => onFocusWindow(w.id), checked: w.id === activeWindowId })),
      ],
  };

  return (
    <header ref={menuRef} className="fixed top-0 left-0 right-0 h-[var(--menubar-height)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm z-[9999] flex items-center justify-between px-4 text-sm text-slate-800 dark:text-slate-100 select-none">
      <div className="flex items-center gap-1">
        <div className="mr-3 w-5 h-5 bg-gradient-to-br from-[var(--accent-color)] to-purple-600 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-sm">S</div>
        {Object.entries(menus).map(([menuName, items]) => (
            <div key={menuName} className="relative">
                <button
                    onClick={() => handleMenuClick(menuName)}
                    aria-label={`${menuName} menu`}
                    className={`px-3 py-1 rounded-md transition-all ${openMenu === menuName ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                    <span className={menuName === 'StudyPro' ? 'font-bold' : 'font-medium'}>{menuName}</span>
                </button>
                {openMenu === menuName && items.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg shadow-glass p-1 border border-white/30 dark:border-white/10 animate-fade-in">
                        {items.map((item, index) => {
                            if (item === 'divider') return <hr key={index} className="my-1 border-gray-400/20" />;
                            const { label, action, disabled, shortcut, checked } = item as { label: string; action: () => void; disabled?: boolean; shortcut?: string; checked?: boolean };
                            return (
                                <MenuItem key={label} onClick={() => handleItemClick(action)} disabled={disabled} shortcut={shortcut}>
                                    <span className="flex items-center gap-2">
                                        <span className="w-4">{checked && <Check size={14} />}</span>
                                        {label}
                                    </span>
                                </MenuItem>
                            );
                        })}
                    </div>
                )}
            </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <Wifi size={14} className="opacity-80"/>
        <button 
          onClick={onToggleDarkMode}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div className="flex gap-2 font-medium text-xs">
            <span>{formatDate(time)}</span>
            <span>{formatTime(time)}</span>
        </div>
      </div>
    </header>
  );
};

export default MenuBar;
