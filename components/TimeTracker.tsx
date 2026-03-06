import React, { useState, useEffect } from 'react';
import { TimeEntry, ActiveTimer } from '../types';
import { Play, Square, Clock } from 'lucide-react';

interface TimeTrackerProps {
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  onStartTimer: (description: string, project: string) => void;
  onStopTimer: () => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ timeEntries, activeTimer, onStartTimer, onStopTimer }) => {
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('General');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: number;
    if (activeTimer) {
      setDescription(activeTimer.description);
      setProject(activeTimer.project);
      const updateElapsed = () => setElapsed(Math.floor((Date.now() - activeTimer.startTime) / 1000));
      updateElapsed();
      interval = window.setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
      setDescription('');
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStart = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onStartTimer(description, project);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/20 dark:border-black/20 flex-shrink-0">
        <form onSubmit={handleStart} className="flex flex-col md:flex-row gap-3 items-center bg-white dark:bg-slate-700 p-3 rounded-lg">
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you working on?" disabled={!!activeTimer} className="flex-1 w-full bg-transparent border-0 focus:ring-0 text-lg text-slate-900 dark:text-white" />
          <div className="flex items-center gap-2">
            <select value={project} onChange={(e) => setProject(e.target.value)} disabled={!!activeTimer} className="bg-transparent border-0 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0"><option>General</option><option>University</option><option>Work</option></select>
            <div className="font-mono text-xl font-medium text-slate-900 dark:text-white">{formatTime(elapsed)}</div>
            <button type="button" onClick={activeTimer ? onStopTimer : handleStart} disabled={!activeTimer && !description.trim()} className={`${activeTimer ? 'bg-red-500' : 'bg-[var(--accent-color)]'} text-white p-3 rounded-lg disabled:opacity-50`}>
              {activeTimer ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {timeEntries.length > 0 ? (
          <div className="space-y-3">
            {timeEntries.map(entry => (
              <div key={entry.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{entry.description}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{entry.project}</span>
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-lg">{formatTime(entry.duration)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
            <Clock size={48} className="mb-4 opacity-20" />
            <p className="font-medium">No time entries yet.</p>
            <p className="text-sm">Start the timer above to log your work.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;