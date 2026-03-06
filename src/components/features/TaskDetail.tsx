
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, Subtask, Priority, Project, Counter } from '../../types';
import { X, Flag, Calendar, FileText, CheckSquare, Plus, Trash2, Wand2, Loader2, Check, Repeat, Paperclip, UploadCloud, Link as LinkIcon, Tag, Coffee, Minus, Clock } from 'lucide-react';
import { generateSubtasks } from '../../services/geminiService';

interface TaskDetailProps {
  taskId: string;
  tasks: Task[];
  projects: Project[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onClose: () => void;
}

const priorityMap: { [key in Priority]: { label: string; color: string; bg: string; borderColor: string } } = {
  1: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-900/50' },
  2: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', borderColor: 'border-orange-200 dark:border-orange-900/50' },
  3: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-900/50' },
  4: { label: 'None', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', borderColor: 'border-slate-200 dark:border-slate-700' },
};

const TaskDetail: React.FC<TaskDetailProps> = ({ taskId, tasks, projects, setTasks, onClose }) => {
  const task = useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId]);
  
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  const [newTag, setNewTag] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newCounterName, setNewCounterName] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || '');
    }
  }, [task]);

  const updateTask = useCallback((updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, [setTasks, taskId]);

  const handleTitleBlur = () => {
    if (title.trim() === '') setTitle(task?.title || '');
    else if (title !== task?.title) updateTask({ title: title.trim() });
  };

  const handleNotesBlur = () => {
    if (notes !== task?.notes) updateTask({ notes });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const newSub: Subtask = { id: `sub-${Date.now()}`, title: newSubtask.trim(), completed: false };
    const newSubtasks = [...(task?.subtasks || []), newSub];
    updateTask({ subtasks: newSubtasks });
    setNewSubtask('');
  };
  
  const handleToggleSubtask = (subtaskId: string) => {
    const newSubtasks = task?.subtasks?.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask({ subtasks: newSubtasks });
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    const newSubtasks = task?.subtasks?.filter(st => st.id !== subtaskId);
    updateTask({ subtasks: newSubtasks });
  };
  
  const startEditingSubtask = (subtask: Subtask) => {
      setEditingSubtaskId(subtask.id);
      setEditingSubtaskTitle(subtask.title);
  }

  const saveSubtaskEdit = () => {
      if (!editingSubtaskId || !editingSubtaskTitle.trim()) {
          setEditingSubtaskId(null);
          return;
      }
      const newSubtasks = task?.subtasks?.map(st => 
          st.id === editingSubtaskId ? { ...st, title: editingSubtaskTitle } : st
      );
      updateTask({ subtasks: newSubtasks });
      setEditingSubtaskId(null);
  }

  const handleDeleteTask = () => {
    onClose();
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };
  
  const handleGenerateSubtasks = async () => {
    if (!task) return;
    setIsGeneratingSubtasks(true);
    const generated = await generateSubtasks(task.title, task.notes);
    const newSubtasks: Subtask[] = generated.map(title => ({
        id: `sub-${Date.now()}-${Math.random()}`,
        title,
        completed: false,
    }));
    updateTask({ subtasks: [...(task.subtasks || []), ...newSubtasks] });
    setIsGeneratingSubtasks(false);
  };
  
  const handleAddAttachment = () => {
      const name = prompt("Enter file name (simulated upload):");
      if(name) {
          updateTask({ attachments: [...(task?.attachments || []), name] });
      }
  };
  
  const removeAttachment = (index: number) => {
      const newAtt = [...(task?.attachments || [])];
      newAtt.splice(index, 1);
      updateTask({ attachments: newAtt });
  };

  const handleAddTag = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newTag.trim()) return;
      const currentTags = task?.tags || [];
      if(!currentTags.includes(newTag.trim())) {
          updateTask({ tags: [...currentTags, newTag.trim()] });
      }
      setNewTag('');
  };

  const removeTag = (tag: string) => {
      updateTask({ tags: (task?.tags || []).filter(t => t !== tag) });
  };

  const handleAddLink = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newLinkUrl.trim()) return;
      const currentLinks = task?.links || [];
      updateTask({ links: [...currentLinks, { id: `link-${Date.now()}`, url: newLinkUrl.trim() }] });
      setNewLinkUrl('');
  };

  const removeLink = (id: string) => {
      updateTask({ links: (task?.links || []).filter(l => l.id !== id) });
  };

  // Counter functions
  const handleAddCounter = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCounterName.trim()) return;
      const newCounter: Counter = { id: `cnt-${Date.now()}`, name: newCounterName.trim(), count: 0, target: 3 };
      updateTask({ counters: [...(task?.counters || []), newCounter] });
      setNewCounterName('');
  }

  const updateCounter = (id: string, delta: number) => {
      updateTask({
          counters: task?.counters?.map(c => c.id === id ? { ...c, count: Math.max(0, c.count + delta) } : c)
      });
  }
  
  const deleteCounter = (id: string) => {
      updateTask({ counters: (task?.counters || []).filter(c => c.id !== id) });
  }

  if (!task) return null;

  return (
    <aside className="w-[480px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 flex flex-col animate-slide-in-right z-20 shadow-2xl">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-2">
                 <button onClick={() => updateTask({ completed: !task.completed })} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 dark:border-slate-600 hover:border-green-500'}`}>
                     {task.completed && <Check size={14} className="text-white" />}
                 </button>
                 <span className={`text-xs font-bold uppercase tracking-wider ${task.completed ? 'text-green-500' : 'text-gray-400'}`}>
                     {task.completed ? 'Completed' : 'To Do'}
                 </span>
             </div>
             <div className="flex gap-1">
                 <button onClick={handleDeleteTask} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                 <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 transition-colors"><X size={18} /></button>
             </div>
        </div>

        <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full bg-transparent text-2xl font-bold text-slate-900 dark:text-white resize-none border-0 focus:ring-0 p-0 leading-tight mb-4"
            rows={2}
            placeholder="Task Title"
        />
        
        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 items-center">
             {task.tags?.map(tag => (
                   <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-xs flex items-center gap-1 font-medium">
                       <Tag size={10} className="opacity-50"/>
                       {tag}
                       <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-1 opacity-50 hover:opacity-100"><X size={10}/></button>
                   </span>
             ))}
             <form onSubmit={handleAddTag} className="inline-flex">
               <input 
                 type="text" 
                 value={newTag} 
                 onChange={e => setNewTag(e.target.value)} 
                 placeholder="+ Tag" 
                 className="bg-transparent text-xs outline-none w-16 text-gray-400 placeholder:text-gray-400 hover:text-gray-600 focus:text-slate-900 dark:focus:text-white transition-colors"
               />
             </form>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
        
        {/* Properties Grid */}
        <section className="grid grid-cols-2 gap-x-6 gap-y-4">
             {/* Project */}
             <div className="space-y-1.5 col-span-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project</label>
                 <select 
                    value={task.projectId}
                    onChange={(e) => updateTask({ projectId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-shadow"
                 >
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                 </select>
             </div>

             {/* Priority */}
             <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Flag size={10}/> Priority</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(p => {
                        const pm = priorityMap[p as Priority];
                        const isSelected = task.priority === p;
                        return (
                            <button 
                                key={p} 
                                onClick={() => updateTask({ priority: p as Priority })} 
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${isSelected ? `${pm.bg} ${pm.color} ${pm.borderColor} shadow-sm` : 'bg-transparent border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                {pm.label}
                            </button>
                        )
                    })}
                </div>
             </div>

             {/* Dates */}
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Calendar size={10}/> Due Date</label>
                <input 
                    type="date"
                    value={task.deadline ? task.deadline.split('T')[0] : ''}
                    onChange={(e) => updateTask({ deadline: e.target.value ? new Date(e.target.value).toISOString().split('T')[0] : undefined })}
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Clock size={10}/> Time</label>
                <input 
                    type="time"
                    value={task.deadlineTime || ''}
                    onChange={(e) => updateTask({ deadlineTime: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
                />
             </div>

             {/* Recurrence */}
             <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Repeat size={10}/> Recurrence</label>
                <div className="relative">
                    <select
                        value={task.recurrence || 'none'}
                        onChange={(e) => updateTask({ recurrence: e.target.value as 'none' | 'daily' | 'weekly' | 'monthly' })}
                        className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 appearance-none"
                    >
                        <option value="none">Does not repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <Repeat size={14} />
                    </div>
                </div>
             </div>
        </section>

        {/* Subtasks Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <CheckSquare size={14} className="text-[var(--accent-color)]"/> Subtasks
                <span className="text-gray-400 font-normal normal-case">({task.subtasks?.filter(s => s.completed).length || 0}/{task.subtasks?.length || 0})</span>
            </h3>
            <button onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks} className="text-xs flex items-center gap-1 text-[var(--accent-color)] hover:underline disabled:opacity-50 font-medium px-2 py-1 rounded hover:bg-[var(--accent-color)]/10 transition-colors">
              {isGeneratingSubtasks ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
              AI Generate
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
             {task.subtasks && task.subtasks.length > 0 && (
                <div className="h-1 w-full bg-gray-100 dark:bg-slate-800">
                    <div 
                        className="h-full bg-[var(--accent-color)] transition-all duration-300" 
                        style={{width: `${task.subtasks?.length ? (task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100 : 0}%`}}
                    ></div>
                </div>
             )}

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {task.subtasks?.map(st => (
                <div key={st.id} className="group flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                    <button onClick={(e) => { e.stopPropagation(); handleToggleSubtask(st.id); }} className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.completed ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-gray-300 dark:border-slate-600 hover:border-[var(--accent-color)]'}`}>
                    {st.completed && <Check size={10} className="text-white"/>}
                    </button>
                    
                    {editingSubtaskId === st.id ? (
                        <input 
                            type="text"
                            value={editingSubtaskTitle}
                            onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                            onBlur={saveSubtaskEdit}
                            onKeyDown={(e) => e.key === 'Enter' && saveSubtaskEdit()}
                            className="flex-1 bg-white dark:bg-slate-800 text-sm px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                            autoFocus
                        />
                    ) : (
                        <div className="flex-1 flex justify-between items-start" onClick={() => startEditingSubtask(st)}>
                            <span className={`text-sm ${st.completed ? 'line-through text-gray-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                {st.title}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSubtask(st.id); }} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                        </div>
                    )}
                </div>
                ))}
                <form onSubmit={(e) => { e.preventDefault(); handleAddSubtask();}} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900">
                  <Plus size={16} className="text-gray-400"/>
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add subtask..."
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-sm placeholder:text-gray-400 text-slate-700 dark:text-slate-200"
                  />
                </form>
            </div>
          </div>
        </section>

        {/* Links & Counters */}
        <div className="space-y-6">
            {/* Links */}
            <section className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                        <LinkIcon size={14} className="text-[var(--accent-color)]"/> Links
                    </h3>
                </div>
                <div className="space-y-2">
                    {task.links?.map(link => (
                        <div key={link.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 p-2 rounded-lg text-sm group border border-gray-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate flex-1">{link.url}</a>
                            <button onClick={() => removeLink(link.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                        </div>
                    ))}
                    <form onSubmit={handleAddLink} className="flex gap-2">
                        <input 
                            type="url" 
                            value={newLinkUrl} 
                            onChange={e => setNewLinkUrl(e.target.value)} 
                            placeholder="Paste URL..." 
                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-slate-700 py-1 text-sm focus:border-[var(--accent-color)] focus:outline-none text-slate-700 dark:text-slate-300 placeholder:text-gray-400"
                        />
                        <button type="submit" disabled={!newLinkUrl.trim()} className="text-xs font-bold text-[var(--accent-color)] disabled:opacity-50">Add</button>
                    </form>
                </div>
            </section>

            {/* Counters */}
             <section className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                        <Coffee size={14} className="text-[var(--accent-color)]"/> Counters
                    </h3>
                </div>
                <div className="space-y-2">
                    {task.counters?.map(counter => (
                        <div key={counter.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900 p-2 rounded-lg border border-gray-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <button onClick={() => deleteCounter(counter.id)} className="text-gray-300 hover:text-red-500"><X size={12}/></button>
                                <span className="text-sm font-medium">{counter.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono font-medium">{counter.count} / {counter.target || '∞'}</span>
                                <div className="flex bg-white dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                    <button onClick={() => updateCounter(counter.id, -1)} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700 border-r border-gray-200 dark:border-slate-700 text-gray-500"><Minus size={12}/></button>
                                    <button onClick={() => updateCounter(counter.id, 1)} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"><Plus size={12}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <form onSubmit={handleAddCounter} className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCounterName} 
                            onChange={e => setNewCounterName(e.target.value)} 
                            placeholder="Add counter (e.g. Water)" 
                            className="flex-1 bg-transparent border-b border-gray-200 dark:border-slate-700 py-1 text-sm focus:border-[var(--accent-color)] focus:outline-none text-slate-700 dark:text-slate-300 placeholder:text-gray-400"
                        />
                        <button type="submit" disabled={!newCounterName.trim()} className="text-xs font-bold text-[var(--accent-color)] disabled:opacity-50">Add</button>
                    </form>
                 </div>
             </section>
        </div>

        {/* Attachments */}
        <section>
            <div className="flex items-center justify-between mb-2">
                 <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2"><Paperclip size={14} className="text-[var(--accent-color)]"/> Attachments</h3>
                 <button onClick={handleAddAttachment} className="text-xs text-[var(--accent-color)] hover:underline flex items-center gap-1 font-medium"><UploadCloud size={12}/> Upload</button>
            </div>
            {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-2">
                    {task.attachments.map((att, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg text-sm group border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-2 truncate">
                                <FileText size={14} className="text-gray-400"/>
                                <span className="truncate text-slate-700 dark:text-slate-300">{att}</span>
                            </div>
                            <button onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={14}/></button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">No files attached.</p>
            )}
        </section>

        {/* Notes */}
        <section className="flex-1 pb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><FileText size={14} className="text-[var(--accent-color)]"/> Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add context, details, or ideas..."
            className="w-full h-40 bg-yellow-50 dark:bg-slate-800/30 rounded-xl p-4 text-sm border-0 focus:ring-1 focus:ring-[var(--accent-color)] resize-none text-slate-700 dark:text-slate-300 leading-relaxed custom-scrollbar shadow-inner"
          />
        </section>
        
        <div className="text-[10px] text-gray-300 dark:text-slate-700 text-center pt-4 border-t border-gray-100 dark:border-slate-800">
             Task ID: {task.id}
        </div>
        
      </div>
    </aside>
  );
};

export default TaskDetail;
