import React, { useState, useMemo } from 'react';
import { JournalEntry } from '../types';
import { Smile, Meh, Frown, Zap, Plus, BookOpen, Search, X } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const Journal: React.FC<JournalProps> = ({ entries, onAddEntry }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<JournalEntry['mood']>('neutral');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddEntry({ title: newTitle, content: newContent, mood: newMood });
    setNewTitle(''); setNewContent(''); setNewMood('neutral'); setIsWriting(false);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="text-green-500" />;
      case 'focused': return <Zap className="text-yellow-500" />;
      case 'tired': return <Frown className="text-blue-500" />;
      default: return <Meh className="text-gray-500" />;
    }
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) {
      return entries;
    }
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex-shrink-0">My Journal</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search journal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[var(--accent-color)] pl-9 pr-8 py-2"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => setIsWriting(!isWriting)} className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
            {isWriting ? 'Cancel' : <><Plus size={16} /> New Entry</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {isWriting && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4 space-y-3 animate-fade-in">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Entry Title" className="flex-1 bg-transparent text-lg font-bold text-slate-900 dark:text-white border-none focus:ring-0 p-0" autoFocus />
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                  {['happy', 'neutral', 'focused', 'tired'].map((m) => (
                    <button key={m} type="button" onClick={() => setNewMood(m as JournalEntry['mood'])} className={`p-1.5 rounded-md ${newMood === m ? 'bg-white dark:bg-slate-600' : 'opacity-50'}`}>{getMoodIcon(m)}</button>
                  ))}
                </div>
              </div>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your thoughts..." className="w-full h-32 bg-gray-50 dark:bg-slate-900/50 rounded-lg border-0 focus:ring-2 focus:ring-[var(--accent-color)] p-2 mt-2" />
              <div className="flex justify-end mt-2">
                <button type="submit" disabled={!newTitle.trim() || !newContent.trim()} className="bg-[var(--accent-color)] text-white px-4 py-1.5 rounded-lg font-medium text-sm disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        )}
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4 animate-fade-in">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full">{getMoodIcon(entry.mood)}</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{entry.title}</h3>
                  <span className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))
        ) : (
          !isWriting && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 pt-8">
              {entries.length === 0 ? (
                 <>
                  <BookOpen size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Your journal is empty.</p>
                  <p className="text-sm">Click &quot;New Entry&quot; to write down your thoughts.</p>
                 </>
              ) : (
                <>
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No results found.</p>
                  <p className="text-sm">Try searching for different keywords.</p>
                </>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Journal;