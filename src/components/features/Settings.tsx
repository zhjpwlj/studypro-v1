
import React, { useState, useEffect, useContext } from 'react';
import { Database, Cloud, Loader2, User as UserIcon, Globe, Palette, Sun, Moon, Check, Info, Upload } from 'lucide-react';
import { backupData, restoreData, getLastSyncTime, signOut } from '../../services/supabaseService';
import ConfirmationModal from '../ui/ConfirmationModal';
import { LanguageContext } from '../../contexts/LanguageContext';
import { Language } from '../../types';
import { wallpapers, wallpaperCategories, accentColors } from '../../config/theme';
import { User } from '@supabase/supabase-js';

interface SettingsProps {
  onExportData: () => void;
  onImportData: (file: File) => void;
  onWipeData: () => void;
  getAllData: () => Record<string, unknown>;
  onRestoreData: (data: Record<string, unknown>) => void;
  user: User;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  accentColor: string;
  onSetAccentColor: (color: string) => void;
  wallpaper: string;
  onSetWallpaper: (wallpaperId: string) => void;
}

// Settings component for managing application preferences
const Settings: React.FC<SettingsProps> = (props) => {
  const { onExportData, onImportData, onWipeData, getAllData, onRestoreData, user, isDarkMode, onToggleDarkMode, accentColor, onSetAccentColor, wallpaper, onSetWallpaper } = props;
  const [activeTab, setActiveTab] = useState('general');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const { language, setLanguage, t } = useContext(LanguageContext);
  
  const [activeWallpaperCategory, setActiveWallpaperCategory] = useState(wallpaperCategories[0]);

  const fetchLastSync = async () => {
    try {
        const time = await getLastSyncTime();
        setLastSynced(time ? new Date(time).toLocaleString() : 'Never');
    } catch {
        setLastSynced('Could not retrieve status');
    }
  };

  useEffect(() => {
    if (activeTab === 'sync' && !lastSynced) fetchLastSync();
  }, [activeTab, lastSynced]);

  const handleBackup = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
        const { error } = await backupData(user, getAllData());
        if (error) throw error;
        await fetchLastSync();
    } catch (error: unknown) {
        setSyncError(`Backup failed: ${(error as Error).message}`);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
        const { data, error } = await restoreData(user);
        if (error) throw error;
        if (data) onRestoreData(data as Record<string, unknown>);
        else setSyncError("No backup found to restore.");
    } catch (error: unknown) {
        setSyncError(`Restore failed: ${(error as Error).message}`);
    } finally {
        setIsSyncing(false);
    }
  };
  
  const handleSignOut = async () => await signOut();

  const renderGeneralTab = () => (
     <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('generalSettings')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe size={20} />
                    <div>
                        <h4 className="font-semibold">{t('language')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('selectLanguage')}</p>
                    </div>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5">
                    <option value="en">English</option>
                    <option value="jp">日本語</option>
                    <option value="cn">中文</option>
                    <option value="es">Español</option>
                </select>
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('systemInfo')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700/50 space-y-3">
             <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Info size={18} className="text-accent" />
                <span className="font-medium">{t('versionLabel')}</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs">1.0.0</span>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-7">&quot;{t('geminiCode')}&quot;</p>
             <button 
               onClick={() => setIsHistoryModalOpen(true)}
               className="ml-7 text-xs text-accent hover:underline flex items-center gap-1"
             >
               <Info size={12} />
               {t('changeHistory')}
             </button>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('localData')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('importDataTitle')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('importDataDesc')}</p>
              </div>
              <label className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer flex items-center gap-2">
                <Upload size={16} />
                <span>{t('importButton')}</span>
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportData(file);
                  }} 
                />
              </label>
            </div>
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('export')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('exportDataDesc')}</p>
              </div>
              <button onClick={onExportData} className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">{t('exportButton')}</button>
            </div>
             <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold text-red-500">{t('wipeData')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('wipeDataDesc')}</p>
              </div>
              <button onClick={onWipeData} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">{t('wipeData')}</button>
            </div>
          </div>
        </section>
      </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('appearanceTitle')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={20}/> : <Sun size={20}/>}
                  <div>
                    <h4 className="font-semibold">{t('interfaceTheme')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('interfaceThemeDesc')}</p>
                  </div>
              </div>
              <button onClick={onToggleDarkMode} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-medium">{isDarkMode ? t('dark') : t('light')}</button>
            </div>
            <div className="pt-4 first:pt-0">
              <h4 className="font-semibold mb-3">{t('accentColor')}</h4>
              <div className="flex flex-wrap gap-4 items-center">
                  {accentColors.map(color => (
                    <button key={color.name} onClick={() => onSetAccentColor(color.hex)} className="w-8 h-8 rounded-full transition-transform transform hover:scale-110 flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                      {accentColor === color.hex && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                  <input type="color" value={accentColor} onChange={e => onSetAccentColor(e.target.value)} className="w-10 h-10 p-0 border-none rounded-full cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/20" />
              </div>
            </div>
          </div>
        </section>
        <section>
            <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('wallpaperTitle')}</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
                <div className="flex flex-wrap gap-2 mb-4">
                  {wallpaperCategories.map(cat => (
                      <button key={cat} onClick={() => setActiveWallpaperCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeWallpaperCategory === cat ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2">
                    {wallpapers.filter(w => w.category === activeWallpaperCategory).map(wp => (
                        <button key={wp.id} onClick={() => onSetWallpaper(wp.id)} className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors relative group ${wallpaper === wp.id ? 'border-accent' : 'border-transparent hover:border-gray-400'}`}>
                            <img src={isDarkMode ? wp.darkUrl : wp.lightUrl} alt={wp.id} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {wallpaper === wp.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Check size={24} className="text-white"/></div>}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    </div>
  );
  
  const renderSyncTab = () => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('accountTitle')}</h3>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserIcon size={18} />
                    <div>
                        <h4 className="font-semibold">{t('loggedInAsTitle')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut} className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700">{t('logOutButton')}</button>
            </div>
           </div>
        </section>
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{t('cloudSyncTitle')}</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
             <div className="text-sm pt-4 first:pt-0">
                <p className="text-gray-500 dark:text-gray-400">{t('cloudSyncDesc')}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('lastSyncedLabel')} <span className="font-semibold text-slate-700 dark:text-slate-300">{lastSynced || 'Loading...'}</span></p>
                {syncError && <p className="text-red-500 mt-1">{syncError}</p>}
             </div>
             <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('forceBackupTitle')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('forceBackupDesc')}</p>
              </div>
              <button onClick={handleBackup} disabled={isSyncing} className="w-28 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center">
                {isSyncing ? <Loader2 className="animate-spin" size={18}/> : t('backupButton')}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('forceRestoreTitle')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('forceRestoreDesc')}</p>
              </div>
              <button onClick={() => setIsRestoreModalOpen(true)} disabled={isSyncing} className="w-28 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center">
                 {isSyncing ? <Loader2 className="animate-spin" size={18}/> : t('restoreButton')}
              </button>
            </div>
          </div>
        </section>
    </div>
  );

  const TABS = [
      { id: 'general', label: t('general'), icon: Database },
      { id: 'appearance', label: t('appearance'), icon: Palette },
      { id: 'sync', label: t('account'), icon: Cloud },
  ];

  return (
    <div className="h-full flex">
      <aside className="w-52 bg-black/5 dark:bg-white/5 p-3 border-r border-white/20 dark:border-black/20">
        <nav className="space-y-1">
           {TABS.map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-left ${activeTab === tab.id ? 'bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
            </button>
           ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto bg-slate-50/30 dark:bg-transparent">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'sync' && renderSyncTab()}
      </main>
      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={() => { setIsRestoreModalOpen(false); handleRestore(); }}
        title={t('restoreModalTitle')}
        message={t('restoreModalMessage')}
        confirmText={t('restoreConfirmButton')}
      />
      
      <ConfirmationModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onConfirm={() => setIsHistoryModalOpen(false)}
        title={t('changeHistory')}
        message={
          <div className="space-y-4 text-left">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">v1.0.0 - Stable Release</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                <li>Initial stable release of StudyPro OS</li>
                <li>Integrated Gemini 3.1 Pro for advanced AI assistance</li>
                <li>Full Markdown support in Notes</li>
                <li>Real-time Cloud Sync via Supabase</li>
                <li>Multi-language support (EN, JP, CN, ES)</li>
                <li>Advanced Task Management with subtasks and projects</li>
                <li>Focus Timer with project tracking</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white">Bug Fixes & Improvements</h4>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mt-1 space-y-1">
                <li>Fixed image loading issues with referrer policies</li>
                <li>Optimized cloud sync frequency to prevent excessive API calls</li>
                <li>Improved accessibility with ARIA labels</li>
                <li>Enhanced UI responsiveness for mobile devices</li>
                <li>Fixed TypeScript type error in ConfirmationModal to support ReactNode messages</li>
                <li>Fixed linting error in ConfirmationModal by removing unused React import</li>
              </ul>
            </div>
          </div>
        }
        confirmText={t('close')}
      />
    </div>
  );
};

export default Settings;
