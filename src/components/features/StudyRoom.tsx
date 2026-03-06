

import React, { useState, useContext } from 'react';
import { Users, Zap } from 'lucide-react';
import { LanguageContext } from '../../contexts/LanguageContext';

interface Desk {
  id: number;
  occupant?: { name: string; status: string; color: string; };
}

const StudyRoom: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const [desks, setDesks] = useState<Desk[]>(Array.from({ length: 20 }, (_, i) => {
      // Mock initial data
      if (i === 2) return { id: i, occupant: { name: 'Sarah', status: 'Reading', color: '#f472b6' } };
      if (i === 5) return { id: i, occupant: { name: 'Mike', status: 'Deep Work', color: '#60a5fa' } };
      if (i === 8) return { id: i, occupant: { name: 'Alex', status: 'Writing', color: '#a78bfa' } };
      return { id: i };
  }));

  const [mySeat, setMySeat] = useState<number | null>(null);
  const [status, setStatus] = useState('Focusing');

  const handleSit = (id: number) => {
    if (mySeat !== null) {
        // Stand up first
        setDesks(prev => prev.map(d => d.id === mySeat ? { ...d, occupant: undefined } : d));
    }
    
    if (mySeat === id) {
        setMySeat(null);
        return;
    }

    setDesks(prev => prev.map(d => d.id === id ? { 
        ...d, 
        occupant: { name: t('you'), status: status, color: 'var(--accent-color)' } 
    } : d));
    setMySeat(id);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-gradient-to-b from-blue-50 to-orange-50 dark:from-[#0f172a] dark:to-[#1e1b4b] relative overflow-hidden">
       {/* Background decorative elements */}
      <div className="absolute top-10 -left-10 w-40 h-40 bg-rose-200/50 dark:bg-rose-500/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-5 -right-10 w-40 h-40 bg-sky-200/50 dark:bg-sky-500/10 rounded-full blur-2xl"></div>
      
      <header className="flex justify-between items-center mb-6 flex-shrink-0 z-10">
         <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-indigo-500"/>
                {t('virtualLibrary')}
            </h2>
            <p className="text-xs text-slate-500">{t('librarySubtitle')}</p>
         </div>
         <div className="flex items-center gap-2">
             <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 {desks.filter(d => d.occupant).length} {t('online')}
             </span>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2" style={{ perspective: '1000px' }}>
          <div className="grid grid-cols-4 gap-y-10 gap-x-6 pb-6" style={{ transform: 'rotateX(25deg)', transformOrigin: 'center top' }}>
              {desks.map((desk) => (
                  <button
                    key={desk.id}
                    onClick={() => !desk.occupant || desk.occupant.name === t('you') ? handleSit(desk.id) : null}
                    disabled={!!desk.occupant && desk.occupant.name !== t('you')}
                    className={`
                        aspect-[4/3] rounded-lg relative transition-all duration-300 group
                        ${desk.occupant 
                            ? 'bg-white/70 dark:bg-slate-800/70 shadow-lg border border-transparent' 
                            : 'bg-slate-200/50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer'
                        }
                    `}
                  >
                      {/* Desk Surface */}
                      <div className="absolute inset-x-0 top-0 h-full rounded-lg" style={{transform: 'translateZ(10px)'}}>
                          {desk.occupant ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base mb-1 shadow-md"
                                    style={{ backgroundColor: desk.occupant.color }}
                                  >
                                      {desk.occupant.name[0]}
                                  </div>
                                  <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{desk.occupant.name}</span>
                                  <span className="text-[9px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full mt-1 text-slate-500">{desk.occupant.status}</span>
                              </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-slate-400 font-medium text-xs">
                                {t('sitHere')}
                            </div>
                          )}
                      </div>
                      
                      {/* Chair */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/5 h-6 bg-slate-300/80 dark:bg-slate-700/80 rounded-t-md" style={{transform: 'translateZ(-10px)'}}></div>
                  </button>
              ))}
          </div>
      </div>

      {mySeat !== null && (
          <div className="mt-4 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between animate-slide-in-right z-10">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                      <Zap size={20} />
                  </div>
                  <div>
                      <p className="font-bold text-sm dark:text-white">{t('currentStatus')}</p>
                      <select 
                        value={status} 
                        onChange={(e) => { setStatus(e.target.value); handleSit(mySeat); }} // Re-sit to update
                        className="text-xs bg-transparent border-none p-0 text-slate-500 focus:ring-0 cursor-pointer"
                      >
                          <option>{t('focusing')}</option>
                          <option>{t('reading')}</option>
                          <option>{t('takingBreak')}</option>
                      </select>
                  </div>
              </div>
              <button onClick={() => { handleSit(mySeat); }} className="text-sm text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors">
                  {t('leaveSeat')}
              </button>
          </div>
      )}
    </div>
  );
};

export default StudyRoom;