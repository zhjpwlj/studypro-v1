import React, { useState } from 'react';
import { Image as ImageIcon, Check, Star, PawPrint, Film, Coffee, Building, Mountain, WandSparkles, PlayCircle, Youtube } from 'lucide-react';
import { wallpapers, wallpaperCategories, accentColors, liveWallpapers } from '../config/theme';

interface ThemeProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  accentColor: string;
  onSetAccentColor: (color: string) => void;
  wallpaper: string;
  onSetWallpaper: (wallpaperId: string) => void;
}

const categoryIcons = {
  'Specials': WandSparkles,
  'Exclusive': Star,
  'Animal': PawPrint,
  'Anime': Film,
  'Cafe': Coffee,
  'City': Building,
  'Nature': Mountain,
};

const Theme: React.FC<ThemeProps> = ({ isDarkMode, accentColor, onSetAccentColor, wallpaper, onSetWallpaper }) => {
  const [activeTab, setActiveTab] = useState<'static' | 'live'>('static');
  const [activeCategory, setActiveCategory] = useState(wallpaperCategories[0]);
  const [customAccentColor, setCustomAccentColor] = useState(accentColor);
  const [customVideoUrl, setCustomVideoUrl] = useState('');

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomAccentColor(newColor);
    onSetAccentColor(newColor);
  }

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCustomVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = getYouTubeId(customVideoUrl);
    if (videoId) {
      onSetWallpaper(`live:${videoId}`);
      setCustomVideoUrl('');
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const filteredWallpapers = wallpapers.filter(wp => wp.category === activeCategory);

  return (
    <div className="h-full flex flex-col bg-slate-900/80 text-white backdrop-blur-lg">
       <div className="p-4 border-b border-white/10 flex-shrink-0">
            <h2 className="text-xl font-bold">Background Themes</h2>
            <div className="flex gap-2 mt-3 border-b border-white/10 pb-0 text-sm">
                <button 
                  onClick={() => setActiveTab('static')}
                  className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'static' ? 'border-[var(--accent-color)] text-white' : 'border-transparent text-white/50 hover:text-white'}`}
                >
                  Static Themes
                </button>
                <button 
                  onClick={() => setActiveTab('live')}
                  className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'live' ? 'border-[var(--accent-color)] text-white' : 'border-transparent text-white/50 hover:text-white'}`}
                >
                  Live Themes
                </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          
          {activeTab === 'static' ? (
            <>
              <div className="flex flex-wrap gap-3 mb-6">
                  {wallpaperCategories.map(cat => {
                      const Icon = categoryIcons[cat as keyof typeof categoryIcons] || ImageIcon;
                      return (
                          <button 
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? 'bg-[var(--accent-color)]' : 'bg-white/10 hover:bg-white/20'}`}
                          >
                              <Icon size={16} />
                              <span>{cat}</span>
                          </button>
                      )
                  })}
              </div>

              <h3 className="text-lg font-semibold mb-3">{activeCategory}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWallpapers.map(wp => (
                  <button
                    key={wp.id}
                    onClick={() => onSetWallpaper(wp.id)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors relative group ${wallpaper === wp.id ? 'border-[var(--accent-color)]' : 'border-transparent hover:border-gray-400'}`}
                  >
                    <img src={isDarkMode ? wp.darkUrl : wp.lightUrl} alt={wp.id} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {wallpaper === wp.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Check size={32} className="text-white"/>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
               <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="text-sm font-bold uppercase text-white/50 mb-3 flex items-center gap-2">
                    <Youtube size={16}/> Custom Live Wallpaper
                  </h3>
                  <form onSubmit={handleCustomVideoSubmit} className="flex gap-2">
                    <input 
                      type="text" 
                      value={customVideoUrl}
                      onChange={(e) => setCustomVideoUrl(e.target.value)}
                      placeholder="Paste YouTube URL (e.g. https://youtu.be/...)"
                      className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                    />
                    <button type="submit" disabled={!customVideoUrl} className="bg-[var(--accent-color)] px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">Set</button>
                  </form>
               </div>

               <div>
                  <h3 className="text-lg font-semibold mb-3">Featured Live Scenes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {liveWallpapers.map(wp => (
                      <button
                        key={wp.id}
                        onClick={() => onSetWallpaper(wp.id)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors relative group ${wallpaper === wp.id ? 'border-[var(--accent-color)]' : 'border-transparent hover:border-gray-400'}`}
                      >
                        <img src={wp.thumbUrl} alt={wp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2">
                           <span className="text-xs font-bold truncate">{wp.name}</span>
                        </div>
                        <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-md">
                           <PlayCircle size={14} className="text-white fill-white"/>
                        </div>
                        {wallpaper === wp.id && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Check size={32} className="text-white"/>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-bold mb-4">Accent Color</h3>
             <div className="flex flex-wrap gap-4 items-center">
                {accentColors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => {
                        onSetAccentColor(color.hex);
                        setCustomAccentColor(color.hex);
                    }}
                    className="w-8 h-8 rounded-full transition-transform transform hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    {accentColor === color.hex && <Check size={16} className="text-white" />}
                  </button>
                ))}
                <div className="relative">
                  <input
                    type="color"
                    value={customAccentColor}
                    onChange={handleCustomColorChange}
                    className="w-10 h-10 p-0 border-none rounded-full cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/20"
                    title="Custom Color"
                  />
                </div>
              </div>
          </div>
        </div>
    </div>
  );
};

export default Theme;