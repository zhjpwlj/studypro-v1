
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getSession, onAuthStateChange, restoreData, signOut } from '../services/supabaseService';
const App = lazy(() => import('../App'));
import Login from './Login';
import { Loader2 } from 'lucide-react';
import { wallpapers } from '../config/theme';
import { usePersistentState } from '../hooks/usePersistentState';
import { User } from '@supabase/supabase-js';

// Create a mock user for the demo mode
const demoUser: User = {
    id: 'demo-user-12345',
    app_metadata: { provider: 'email' },
    user_metadata: { name: 'Demo User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'demo@studypro.app',
} as unknown as User;

const AuthGate: React.FC = () => {
    const [session, setSession] = useState<{ user: User; access_token?: string } | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    
    
    const [wallpaper] = usePersistentState<string>('focusflow-theme-wallpaper', 'deep_space');
    const [isDarkMode] = usePersistentState<boolean>('focusflow-theme-dark', () => window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const currentWallpaper = wallpapers.find(w => w.id === wallpaper) || wallpapers.find(w => w.id === 'deep_space') || wallpapers[0];
    
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);
    
    const handleRestoreData = (data: Record<string, unknown>): void => {
        try {
            // Define mapping of data keys to localStorage keys
            const dataMap: { [key: string]: string | { [key: string]: string } } = {
                projects: 'focusflow-projects',
                tasks: 'focusflow-tasks',
                timeEntries: 'focusflow-timeEntries',
                notes: 'focusflow-notes',
                events: 'focusflow-events',
                goals: 'focusflow-goals',
                classes: 'focusflow-classes',
                decks: 'focusflow-decks',
                settings: {
                    isDarkMode: 'focusflow-theme-dark',
                    accentColor: 'focusflow-theme-accent',
                    wallpaper: 'focusflow-theme-wallpaper',
                    language: 'focusflow-language',
                },
                windows: 'focusflow-windows'
            };

            // Clear existing app data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('focusflow-')) {
                    localStorage.removeItem(key);
                }
            });

            // Set new data from backup
            Object.keys(data).forEach(key => {
                if (key === 'settings' && data[key] && typeof data[key] === 'object') {
                    const settings = data[key] as Record<string, unknown>;
                    Object.keys(settings).forEach(settingKey => {
                        const localStorageKey = (dataMap.settings as Record<string, string>)[settingKey];
                        if (localStorageKey) {
                           localStorage.setItem(localStorageKey, JSON.stringify(settings[settingKey]));
                        }
                    });
                } else if (dataMap[key]) {
                    localStorage.setItem(dataMap[key] as string, JSON.stringify(data[key]));
                }
            });

        } catch (error: unknown) {
            console.error("Failed to restore data:", error);
        }
    };
    
    useEffect(() => {
        const handleAuth = async (): Promise<void> => {
            try {
                if (window.location.hash.includes('access_token')) {
                    setIsVerifying(true);
                }

                const { session: currentSession } = await getSession();
                if (currentSession) {
                    setSession(currentSession);
                    setUser(currentSession.user);
                    await restoreAndSetData(currentSession.user);
                }
            } catch (err) {
                console.error("Session check error:", err);
            } finally {
                setIsVerifying(false);
                setLoading(false);
            }
        };

        const restoreAndSetData = async (currentUser: User): Promise<void> => {
            try {
                const { data, error } = await restoreData(currentUser);
                if (error) {
                    console.error("Failed to fetch initial data", error);
                    if (error.message?.includes('User not authenticated') || error.message?.includes('JWT') || error.message?.includes('invalid')) {
                        await signOut();
                        setSession(null);
                        setUser(null);
                    }
                } else if (data) {
                    handleRestoreData(data);
                }
            } catch (err) {
                console.error("Data restore error:", err);
            }
        };

        handleAuth();

        const authListener = onAuthStateChange(async (newSession): Promise<void> => {
            setSession(newSession);
            setUser(newSession?.user || null);
            setLoading(false);
            if (newSession) {
                await restoreAndSetData(newSession.user);
            } else {
                sessionStorage.removeItem('focusflow_data_restored');
            }
        });

        return (): void => {
            authListener?.unsubscribe();
        };
    }, []);

    const handleEnterDemoMode = (): void => {
        setUser(demoUser);
        setSession({ user: demoUser }); 
        setLoading(false);
    };

    if (loading || isVerifying) {
        return (
            <div 
              className="h-screen w-screen flex items-center justify-center bg-cover bg-center" 
              style={{ backgroundImage: `url(${isDarkMode ? currentWallpaper.darkUrl : currentWallpaper.lightUrl})`}}
            >
                <div className="flex flex-col items-center gap-4 p-8 bg-black/30 rounded-2xl backdrop-blur-md">
                   <Loader2 size={48} className="animate-spin text-white" />
                   <span className="text-white font-medium">{isVerifying ? 'Verifying session...' : 'Loading StudyPro...'}</span>
                </div>
            </div>
        );
    }
    
    if (session && user) {
        return (
            <Suspense fallback={
                <div 
                  className="h-screen w-screen flex items-center justify-center bg-cover bg-center" 
                  style={{ backgroundImage: `url(${isDarkMode ? currentWallpaper.darkUrl : currentWallpaper.lightUrl})`}}
                >
                    <div className="flex flex-col items-center gap-4 p-8 bg-black/30 rounded-2xl backdrop-blur-md">
                       <Loader2 size={48} className="animate-spin text-white" />
                       <span className="text-white font-medium">Loading StudyPro...</span>
                    </div>
                </div>
            }>
                <App user={user} onRestoreData={handleRestoreData} />
            </Suspense>
        );
    }

    return (
        <div 
          className="h-screen w-screen flex items-center justify-center bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${isDarkMode ? currentWallpaper.darkUrl : currentWallpaper.lightUrl})`}}
        >
            <Login onEnterDemoMode={handleEnterDemoMode} />
        </div>
    );
};

export default AuthGate;
