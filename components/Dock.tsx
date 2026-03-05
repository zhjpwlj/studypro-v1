import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { Grid, Rocket, HeartPulse } from 'lucide-react';
import { appIcons } from '../constants';
import { AppModule, WindowConfig } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface DockProps {
  openWindows: WindowConfig[];
  onLaunch: (appId: AppModule) => void;
  onFocus: (appId: AppModule) => void;
  onToggleLaunchpad: () => void;
}



type DockFolder = {
  type: 'folder';
  name: keyof (typeof import('../utils/translations'))['translations']['en'];
  icon: React.ElementType;
  apps: AppModule[];
};

type DockItem = AppModule | DockFolder | 'divider';

const dockItems: DockItem[] = [
  AppModule.DASHBOARD,
  AppModule.CHAT,
  AppModule.CALENDAR,
  AppModule.TASKS,
  AppModule.NOTES,
  'divider',
  {
    type: 'folder',
    name: 'productivity',
    icon: HeartPulse,
    apps: [AppModule.POMODORO, AppModule.GOALS, AppModule.SOCIAL, AppModule.FLASHCARDS],
  },
  {
    type: 'folder',
    name: 'utilities',
    icon: Grid,
    apps: [AppModule.CALCULATOR, AppModule.WEATHER, AppModule.MUSIC, AppModule.SETTINGS],
  },
];

const BASE_WIDTH = 50; // Base width of icons
const HOVER_WIDTH = 90; // Max width on hover
const DISTANCE_LIMIT = 150; // Pixel distance to affect neighbors

// --- Dock Icon Component ---
interface DockIconProps {
  mouseX: MotionValue<number>;
  children: React.ReactNode;
  onClick: () => void;
  isOpen?: boolean;
  label?: string;
  isActive?: boolean;
}

const DockIcon: React.FC<DockIconProps> = ({ 
  mouseX,
  children, 
  onClick, 
  isOpen, 
  label,
  isActive
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-DISTANCE_LIMIT, 0, DISTANCE_LIMIT], [BASE_WIDTH, HOVER_WIDTH, BASE_WIDTH]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const tooltipOpacity = useTransform(distance, [-50, 0, 50], [0, 1, 0]);
  const tooltipY = useTransform(distance, [-50, 0, 50], [0, -10, 0]);

  return (
    <motion.div
        ref={ref}
        style={{ width, height: width }}
        className="flex flex-col items-center justify-end relative group z-10 mb-2"
    >
      {/* Tooltip */}
      {label && (
        <motion.div 
            style={{ 
              opacity: tooltipOpacity,
              y: tooltipY,
            }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-xs px-2 py-1 rounded-md pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10 z-50 pointer-events-none hidden md:block"
        >
          {label}
        </motion.div>
      )}

      <motion.button
        onClick={onClick}
        aria-label={label || 'Dock Icon'}
        className={`w-full h-full rounded-2xl flex items-center justify-center cursor-pointer transition-colors shadow-lg ${isActive ? 'bg-white/30 dark:bg-white/20 border-white/40' : 'bg-white/10 dark:bg-black/20 border-white/20 hover:bg-white/20 dark:hover:bg-white/10'} border backdrop-blur-md overflow-hidden relative`}
      >
        <motion.div className="w-1/2 h-1/2 text-slate-800 dark:text-white flex items-center justify-center">
            {children}
        </motion.div>
      </motion.button>
      
      {isOpen && (
        <div className="w-1.5 h-1.5 bg-slate-600 dark:bg-slate-300 rounded-full absolute -bottom-3"></div>
      )}
    </motion.div>
  );
};

const folderVariants = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.9 },
};

export default function Dock({ openWindows, onLaunch, onFocus, onToggleLaunchpad }: DockProps) {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const dockRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue<number>(Infinity);
  const { t } = useContext(LanguageContext);
  
  const isOpen = (appId: AppModule): boolean => openWindows.some(w => w.id === appId && !w.isMinimized);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setOpenFolder(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return (): void => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const activeFolder = dockItems.find((i): i is DockFolder => typeof i === 'object' && i.type === 'folder' && i.name === openFolder);

  const handleIconClick = (action: () => void): void => {
      setOpenFolder(null);
      action();
  };

  const renderItem = (item: DockItem, index: number, isGhost: boolean): JSX.Element | null => {
      if (typeof item === 'object' && item.type === 'folder') {
        const isFolderActive = item.apps.some(appId => isOpen(appId));
        const Icon = item.icon;
        const isOpened = openFolder === item.name;
        
        if (isGhost) return <div key={item.name} className="w-[50px] h-[50px] mb-2" />;

        return (
          <DockIcon 
            key={item.name} 
            mouseX={mouseX}
            onClick={() => setOpenFolder(isOpened ? null : item.name)}
            isOpen={isFolderActive}
            label={t(item.name)}
            isActive={isOpened}
          >
              <Icon className="w-full h-full" />
          </DockIcon>
        );
      } else if (item === 'divider') {
        return <div key={`divider-${index}`} className="w-px h-8 bg-white/20 mx-1 self-center mb-4"></div>;
      } else {
        const appId = item as AppModule;
        const Icon = appIcons[appId];
        if (!Icon) return null;

        if (isGhost) return <div key={appId} className="w-[50px] h-[50px] mb-2" />;

        return (
          <DockIcon 
            key={appId} 
            mouseX={mouseX}
            onClick={() => handleIconClick(() => isOpen(appId) ? onFocus(appId) : onLaunch(appId))}
            isOpen={isOpen(appId)}
            label={t(appId.toLowerCase() as keyof typeof import('../utils/translations')['translations']['en'])}
          >
              <Icon className="w-full h-full" />
          </DockIcon>
        );
      }
  }

  // (Dock as { appIcons?: Record<string, React.ElementType> }).appIcons = appIcons;

  return (
    <footer ref={dockRef} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center">
      <AnimatePresence>
        {openFolder && activeFolder && (
            <motion.div 
                variants={folderVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mb-6 bg-white/20 dark:bg-black/40 backdrop-blur-2xl p-4 rounded-3xl border border-white/20 shadow-glass grid grid-cols-4 gap-4 origin-bottom"
            >
                {activeFolder.apps.map((appId) => {
                const Icon = appIcons[appId];
                return (
                    <button 
                        key={appId} 
                        id={`dock-icon-${appId}`} 
                        onClick={() => { onLaunch(appId); setOpenFolder(null); }} 
                        aria-label={t(appId.toLowerCase() as keyof typeof import('../utils/translations')['translations']['en'])}
                        className="flex flex-col items-center justify-center gap-2 group"
                    >
                    <div className="w-14 h-14 flex items-center justify-center bg-white/40 dark:bg-black/30 rounded-2xl border border-white/10 transition-transform group-hover:scale-110 shadow-lg">
                        <Icon className="text-slate-800 dark:text-white" size={28} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-800 dark:text-white truncate w-full text-center">{t(appId.toLowerCase() as keyof typeof import('../utils/translations')['translations']['en'])}</span>
                    </button>
                );
                })}
            </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
         {/* 
            Background Layer (Static Shape)
            This contains invisible items to set the container width. 
            It creates the "Glass Bar" which stays fixed size.
         */}
         <div className="flex items-end gap-3 px-4 pb-3 pt-3 bg-white/30 dark:bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-glass relative z-0">
            {/* Launchpad Ghost */}
            <div className="w-[50px] h-[50px] mb-2" />
            <div className="w-px h-8 bg-transparent mx-1 self-center mb-4"></div>
            {dockItems.map((item, index) => renderItem(item, index, true))}
         </div>

         {/* 
            Interactive Layer (Magnification & Spreading)
            This sits on top, absolutely centered.
            The items here react to the mouse and can grow wider than the background layer.
         */}
         <div 
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="absolute left-1/2 bottom-0 flex items-end gap-3 px-4 pb-3 -translate-x-1/2 z-10"
         >
            <DockIcon mouseX={mouseX} onClick={() => handleIconClick(onToggleLaunchpad)} label={t('launchpad')}>
                 <Rocket className="w-full h-full" />
            </DockIcon>

            <div className="w-px h-8 bg-white/20 mx-1 self-center mb-4"></div>

            {dockItems.map((item, index) => renderItem(item, index, false))}
         </div>
      </div>
    </footer>
  );
}
