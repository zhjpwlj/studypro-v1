import React, { useState, useMemo, useContext } from 'react';
import { X, Search } from 'lucide-react';
import { AppModule } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

interface LaunchpadProps {
  onLaunch: (appId: AppModule) => void;
  onClose: () => void;
  appIcons: Record<string, React.ElementType>;
  appNames: Record<string, string>;
}

const allApps: AppModule[] = Object.values(AppModule);

const Launchpad: React.FC<LaunchpadProps> = ({ onLaunch, onClose, appIcons, appNames }) => {
  const { t } = useContext(LanguageContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) {
      return allApps;
    }
    return allApps.filter(appId => 
      appNames[appId]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, appNames]);

  return (
    <div 
      className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-2xl flex flex-col items-center p-8 animate-fade-in"
      onClick={onClose}
    >
      <div className="w-full max-w-md mb-8 relative" onClick={e => e.stopPropagation()}>
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input 
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          autoFocus
        />
      </div>
      
      <div 
        className="flex-1 w-full max-w-6xl grid grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {filteredApps.map(appId => {
          const Icon = appIcons[appId];
          const name = appNames[appId];
          if (!Icon) return null;
          return (
            <button
              key={appId}
              onClick={() => {
                onLaunch(appId);
                onClose();
              }}
              className="flex flex-col items-center justify-start gap-2 group"
            >
              <div className="w-20 h-20 flex items-center justify-center bg-black/20 rounded-2xl transition-all duration-200 group-hover:scale-110 group-hover:bg-white/20 shadow-lg">
                <Icon className="text-white" size={48} />
              </div>
              <span className="text-sm text-white truncate w-full text-center">{name}</span>
            </button>
          );
        })}
      </div>
       <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20">
         <X size={24} className="text-white" />
       </button>
    </div>
  );
};

export default Launchpad;
