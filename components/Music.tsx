import React, { useState, useRef, useEffect, useContext } from 'react';
import { Music as MusicIcon, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, ListMusic, AlertCircle, Loader2 } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';

const playlist = [
    { title: 'Lofi Study', artist: 'FASSounds', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_18182442cd.mp3' },
    { title: 'Calm Floating', artist: 'Ashot Danielyan', url: 'https://cdn.pixabay.com/audio/2023/10/03/audio_75a2399992.mp3'},
    { title: 'Ambient Classical', artist: 'penguinmusic', url: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2bbe64571b.mp3'},
    { title: 'Just Relax', artist: 'Lesfm', url: 'https://cdn.pixabay.com/audio/2022/05/20/audio_51a2aae3a7.mp3' }
];

const Music: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    if(audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.error("Playback error:", e);
                setIsPlaying(false);
                setError(t('playbackFailed'));
            });
        }
    } else if (!isPlaying && audioRef.current) {
        audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex, t]);

  const handleTimeUpdate = (): void => {
    if(audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleEnded = (): void => {
    handleSkip('forward');
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>): void => {
      console.error("Audio Error:", e);
      setError(t('unableToPlay'));
      setIsPlaying(false);
      setIsBuffering(false);
  };

  const handleSkip = (direction: 'forward' | 'backward'): void => {
      const newIndex = direction === 'forward' 
        ? (currentTrackIndex + 1) % playlist.length
        : (currentTrackIndex - 1 + playlist.length) % playlist.length;
      setCurrentTrackIndex(newIndex);
      setIsPlaying(true); // Auto-play next track
      setError(null);
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!audioRef.current || !isFinite(audioRef.current.duration)) return;
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
      audioRef.current.currentTime = percent * audioRef.current.duration;
      setProgress(percent * 100);
  };

  const togglePlay = (): void => {
      setError(null);
      setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative">
        <audio 
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onError={handleError}
            preload="auto"
        />

        {error && <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-2 animate-fade-in z-10"><AlertCircle size={16} /><span>{error}</span></div>}

        <div className="w-40 h-40 bg-slate-800 rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <MusicIcon size={64} className={`text-slate-600 group-hover:scale-110 transition-transform duration-500 ${isPlaying && !isBuffering ? 'animate-pulse' : ''}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            {isBuffering && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 size={32} className="animate-spin" /></div>}
        </div>
        
        <div>
            <h3 className="text-xl font-bold">{currentTrack.title}</h3>
            <p className="text-slate-400 text-sm">{currentTrack.artist}</p>
        </div>

        <div className="w-full max-w-xs cursor-pointer group" onClick={handleSeek}>
          <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden relative"><div className="h-full bg-white transition-all duration-100 ease-linear" style={{width: `${progress}%`}}></div><div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity"></div></div>
        </div>

        <div className="flex items-center gap-6">
            <button onClick={() => handleSkip('backward')} className="text-slate-300 hover:text-white"><SkipBack size={24} /></button>
            <button onClick={togglePlay} className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">{isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}</button>
            <button onClick={() => handleSkip('forward')} className="text-slate-300 hover:text-white"><SkipForward size={24} /></button>
        </div>
        
        <div className="w-full max-w-xs flex items-center gap-3 text-slate-400">
            <button onClick={() => setIsMuted(!isMuted)}>{isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" />
            <div className="relative">
                <button onClick={() => setIsPlaylistOpen(p => !p)}><ListMusic size={18} /></button>
                {isPlaylistOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800/80 backdrop-blur-md rounded-lg shadow-lg p-2 text-left text-sm animate-fade-in z-20">
                        {playlist.map((track, index) => (
                            <button key={track.url} onClick={() => { setCurrentTrackIndex(index); setIsPlaying(true); }} className={`w-full p-2 rounded flex items-center gap-2 ${index === currentTrackIndex ? 'bg-accent text-white' : 'hover:bg-slate-700'}`}>
                                {index === currentTrackIndex && isPlaying && !isBuffering ? <Play size={14}/> : <MusicIcon size={14}/>}
                                <span className="truncate">{track.title}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Music;