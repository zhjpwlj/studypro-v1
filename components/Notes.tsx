
import React, { useState, useEffect, useContext } from 'react';
import { Note } from '../types';
import { Plus, Trash2, FileText, Folder, FolderOpen, Smile, Meh, Zap, Frown, Book } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';


interface NotesProps {
  notes: Note[];
  onAddNote: (category: string) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

const getMoodIcon = (mood?: Note['mood']): JSX.Element | null => {
  switch (mood) {
    case 'happy': return <Smile size={18} className="text-green-500" />;
    case 'focused': return <Zap size={18} className="text-yellow-500" />;
    case 'tired': return <Frown size={18} className="text-blue-500" />;
    case 'neutral': return <Meh size={18} className="text-gray-500" />;
    default: return null;
  }
};

const Notes: React.FC<NotesProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const { t } = useContext(LanguageContext);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const categories = ['All', 'Journal', ...Array.from(new Set(notes.map(n => n.category || 'General'))).filter(c => c !== 'Journal' && c !== 'All')];

  const filteredNotes = activeCategory === 'All' 
    ? notes 
    : notes.filter(n => n.category === activeCategory);
    
  const sortedNotes = [...filteredNotes].sort((a, b) => b.createdAt - a.createdAt);
  
  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    if (activeNoteId && !notes.find(n => n.id === activeNoteId)) {
      setActiveNoteId(null);
    }
    if(!activeNoteId && sortedNotes.length > 0) {
      setActiveNoteId(sortedNotes[0].id);
    }
  }, [notes, activeNoteId, activeCategory, sortedNotes]);

  const handleAddNote = (): void => {
    const cat = activeCategory === 'All' ? 'General' : activeCategory;
    onAddNote(cat);
  };
  
  return (
    <div className="h-full flex bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      <nav className="w-48 bg-gray-50 dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 flex flex-col p-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{t('folders')}</h3>
        <div className="space-y-1">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeCategory === cat ? 'bg-white dark:bg-slate-800 shadow-sm font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-900'}`}
                >
                    {cat === 'Journal' ? <Book size={14}/> : (activeCategory === cat ? <FolderOpen size={14} className="text-accent"/> : <Folder size={14} />)}
                    {cat === 'All' ? t('all') : cat === 'Journal' ? t('journal') : cat}
                </button>
            ))}
        </div>
      </nav>

      <aside className="w-64 border-r border-gray-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
        <div className="p-3 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-semibold">{activeCategory === 'All' ? t('allNotes') : activeCategory === 'Journal' ? t('journal') : activeCategory} ({sortedNotes.length})</h2>
            <button onClick={handleAddNote} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors" title={t('newNote')}>
                <Plus size={16} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {sortedNotes.map(note => (
                <button 
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full text-left p-3 border-b border-gray-100 dark:border-slate-800/50 transition-colors ${activeNoteId === note.id ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                    <div className="font-medium text-sm truncate flex items-center gap-2">{getMoodIcon(note.mood)} {note.title || t('untitled')}</div>
                    <div className="text-xs text-gray-400 mt-1 truncate pl-1">{note.content.substring(0, 30) || t('noContent')}</div>
                    <span className="block text-[10px] text-gray-400 mt-1 pl-1">{new Date(note.createdAt).toLocaleDateString()}</span>
                </button>
            ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {activeNote ? (
            <>
                <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-4">
                     <input 
                        type="text" 
                        value={activeNote.title}
                        onChange={(e) => onUpdateNote(activeNote.id, { title: e.target.value })}
                        className="flex-1 bg-transparent text-xl font-bold focus:outline-none placeholder:text-gray-300"
                        placeholder={t('noteTitlePlaceholder')}
                     />
                     {activeNote.category === 'Journal' && (
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                          {(['happy', 'neutral', 'focused', 'tired'] as Note['mood'][]).map(m => (
                            <button key={m} type="button" onClick={() => onUpdateNote(activeNote.id, { mood: m })} className={`p-1.5 rounded-md ${activeNote.mood === m ? 'bg-white dark:bg-slate-700' : 'opacity-40 hover:opacity-100'}`}>{getMoodIcon(m)}</button>
                          ))}
                        </div>
                     )}
                     <button onClick={() => onDeleteNote(activeNote.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                     </button>
                </div>
                <textarea
                    key={activeNote.id}
                    value={activeNote.content}
                    onChange={(e) => onUpdateNote(activeNote.id, { content: e.target.value })}
                    className="flex-1 p-6 bg-transparent resize-none focus:outline-none text-base leading-relaxed font-serif text-slate-700 dark:text-slate-300"
                    placeholder={t('startWritingPlaceholder')}
                />
            </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 p-8 text-center bg-gray-50/50 dark:bg-slate-900/50">
                <FileText size={64} className="mb-4 opacity-10" />
                <p className="font-medium">{sortedNotes.length > 0 ? t('noNotes') : t('createFirstNote')}</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default Notes;
