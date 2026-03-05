
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { WindowConfig, AppModule } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface WindowProps {
  children: React.ReactNode;
  config: WindowConfig;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onUpdate: (updates: Partial<WindowConfig>) => void;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const MENUBAR_HEIGHT = 32;
const DOCK_HEIGHT = 90; // Adjusted for new dock

const Window: React.FC<WindowProps> = ({ children, config, onClose, onMinimize, onToggleMaximize, onFocus, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [minimizeTransform, setMinimizeTransform] = useState('scale(1)');
  
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartRect = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  const { t } = useContext(LanguageContext);

  const getTitle = (id: AppModule): string => {
    return t(id.toLowerCase() as keyof typeof import('../utils/translations')['translations']['en']) || 'Application';
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (config.isMinimized) {
        // Fallback or specific logic for framer motion dock icons could go here
        setMinimizeTransform(`translateY(calc(100vh - ${config.y}px)) scale(0)`);
    } else {
        setMinimizeTransform('translate(0, 0) scale(1)');
    }
  }, [config.isMinimized, config.id, config.y]);

  const getEventCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } => 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

  const handleStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, action: 'drag' | { type: 'resize', direction: ResizeDirection }) => {
    if ('button' in e && e.button !== 0) return;
    if (config.isMaximized && action === 'drag') return;
    
    if (action === 'drag' && (e.target as HTMLElement).closest('button')) return;

    e.stopPropagation();
    onFocus();
    
    const { x, y } = getEventCoords(e.nativeEvent);
    dragStartPos.current = { x, y };
    windowStartRect.current = { x: config.x, y: config.y, width: config.width, height: config.height };

    if (action === 'drag') setIsDragging(true);
    else if (action.type === 'resize' && !config.isMaximized) setIsResizing(action.direction);
  }, [config, onFocus]);
  
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    
    const { x: clientX, y: clientY } = getEventCoords(e);
    const dx = clientX - dragStartPos.current.x;
    const dy = clientY - dragStartPos.current.y;
    
    if (isDragging) {
      const newX = windowStartRect.current.x + dx;
      const newY = windowStartRect.current.y + dy;
      const titleBarHeight = 32;
      const clampedX = Math.max(-config.width + 50, Math.min(newX, window.innerWidth - 50));
      const clampedY = Math.max(MENUBAR_HEIGHT, Math.min(newY, window.innerHeight - DOCK_HEIGHT - titleBarHeight));
      onUpdate({ x: clampedX, y: clampedY });
    }
    
    if (isResizing) {
        let { x, y, width, height } = windowStartRect.current;
        if (isResizing.includes('e')) width += dx;
        if (isResizing.includes('w')) { width -= dx; x += dx; }
        if (isResizing.includes('s')) height += dy;
        if (isResizing.includes('n')) { height -= dy; y += dy; }
        
        width = Math.max(300, width);
        height = Math.max(200, height);

        if (y < MENUBAR_HEIGHT) {
            const overflow = MENUBAR_HEIGHT - y;
            y = MENUBAR_HEIGHT;
            height -= overflow;
        }
        if (y + height > window.innerHeight - DOCK_HEIGHT) {
            height = window.innerHeight - DOCK_HEIGHT - y;
        }
        height = Math.max(200, height);
        onUpdate({ x, y, width, height });
    }
  }, [isDragging, isResizing, onUpdate, config.width]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd, { once: true });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd, { once: true });
    }
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, handleMove, handleEnd]);

  // Liquid Glass Classes
  const windowClasses = `
    absolute flex flex-col overflow-hidden
    bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-900/40
    backdrop-blur-2xl
    border border-white/40 dark:border-white/10
    rounded-[var(--window-border-radius)] shadow-glass
    ${isDragging || isResizing ? '' : 'transition-all duration-300 ease-out'}
    ${isMounted && !config.isClosing ? 'opacity-100' : 'opacity-0'}
    ${config.isMinimized ? 'opacity-0 pointer-events-none' : ''}
  `;

  const dynamicStyles: React.CSSProperties = {
    top: config.y,
    left: config.x,
    width: config.width,
    height: config.height,
    zIndex: config.zIndex,
    transform: isMounted && !config.isClosing ? minimizeTransform : 'scale(0.95)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1) inset'
  };
  
  if (config.isMaximized) {
    dynamicStyles.top = MENUBAR_HEIGHT + 10;
    dynamicStyles.left = 10;
    dynamicStyles.width = 'calc(100% - 20px)';
    dynamicStyles.height = `calc(100vh - ${MENUBAR_HEIGHT}px - ${DOCK_HEIGHT + 20}px)`;
    dynamicStyles.borderRadius = 'var(--window-border-radius)';
  }

  return (
    <div ref={windowRef} className={windowClasses} style={dynamicStyles} onMouseDown={onFocus} onTouchStart={onFocus}>
      {!config.isMaximized && (
        <>
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'n'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'n'})} className="absolute top-0 left-2 right-2 h-3 cursor-n-resize z-10" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 's'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 's'})} className="absolute bottom-0 left-2 right-2 h-3 cursor-s-resize z-10" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'w'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'w'})} className="absolute top-2 bottom-2 left-0 w-3 cursor-w-resize z-10" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'e'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'e'})} className="absolute top-2 bottom-2 right-0 w-3 cursor-e-resize z-10" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'nw'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'nw'})} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-20" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'ne'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'ne'})} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-20" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'sw'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'sw'})} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-20" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'se'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'se'})} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20" />
        </>
      )}
      <div
        className="h-10 flex items-center justify-between px-4 flex-shrink-0 border-b border-white/20 dark:border-white/5 bg-white/10 dark:bg-black/10"
        onMouseDown={(e) => handleStart(e, 'drag')}
        onTouchStart={(e) => handleStart(e, 'drag')}
        onDoubleClick={onToggleMaximize}
        style={{ cursor: isDragging ? 'grabbing' : (config.isMaximized ? 'default' : 'grab') }}
      >
        <div className="flex items-center gap-3 group">
          <button onMouseDown={(e) => e.stopPropagation()} onClick={onClose} className="w-5 h-5 bg-[#ff5f56] rounded-full border border-[#e0443e] flex items-center justify-center group-hover:opacity-100 opacity-80 transition-opacity"><span className="opacity-0 group-hover:opacity-100 text-xs font-bold text-black/50">x</span></button>
          <button onMouseDown={(e) => e.stopPropagation()} onClick={onMinimize} className="w-5 h-5 bg-[#ffbd2e] rounded-full border border-[#dea123] flex items-center justify-center group-hover:opacity-100 opacity-80 transition-opacity"><span className="opacity-0 group-hover:opacity-100 text-xs font-bold text-black/50">-</span></button>
          <button onMouseDown={(e) => e.stopPropagation()} onClick={onToggleMaximize} className="w-5 h-5 bg-[#27c93f] rounded-full border border-[#1aab29] flex items-center justify-center group-hover:opacity-100 opacity-80 transition-opacity"><span className="opacity-0 group-hover:opacity-100 text-xs font-bold text-black/50">+</span></button>
        </div>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 select-none opacity-80 text-shadow-sm">{getTitle(config.id)}</span>
        <div className="w-12"></div>
      </div>
      <div className="flex-1 bg-white/40 dark:bg-slate-900/40 overflow-hidden relative w-full h-full">{children}</div>
    </div>
  );
};

export default Window;
