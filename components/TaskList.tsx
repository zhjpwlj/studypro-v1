
import React, { useState, useMemo, useContext } from 'react';
import { Task, Project } from '../types';
import { Plus, ChevronDown, Check, Sun, Inbox, Calendar, Star, Layers, CheckSquare } from 'lucide-react';
import TaskDetail from './TaskDetail';
import { LanguageContext } from '../contexts/LanguageContext';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#4f46e5'];

const priorityMap = {
    1: { color: 'text-red-500', bg: 'bg-red-500' },
    2: { color: 'text-orange-500', bg: 'bg-orange-500' },
    3: { color: 'text-blue-500', bg: 'bg-blue-500' },
    4: { color: 'text-slate-400', bg: 'bg-slate-400' },
};

const TaskList: React.FC<TaskListProps> = ({ tasks, projects, setTasks, setProjects }) => {
  const { t, language } = useContext(LanguageContext);
  const [activeFilter, setActiveFilter] = useState('inbox');
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [isCompletedVisible, setIsCompletedVisible] = useState(true);

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    switch (activeFilter) {
      case 'myday': return tasks.filter(t => t.inMyDay && t.status !== 'done');
      case 'inbox': return tasks.filter(t => !t.projectId || t.projectId === 'inbox' || (!t.inMyDay && !t.deadline && t.status !== 'done'));
      case 'today': return tasks.filter(t => t.deadline === today && t.status !== 'done');
      case 'planned': return tasks.filter(t => t.deadline && t.status !== 'done');
      case 'important': return tasks.filter(t => t.priority === 1 && t.status !== 'done');
      default: 
          if (activeFilter.startsWith('proj-')) return tasks.filter(t => t.projectId === activeFilter);
          if (activeFilter.startsWith('tag-')) return tasks.filter(t => t.tags?.includes(activeFilter.replace('tag-', '')));
          return tasks;
    }
  }, [tasks, activeFilter]);

  const incompleteTasks = useMemo(() => filteredTasks.filter(t => !t.completed), [filteredTasks]);
  const completedTasks = useMemo(() => filteredTasks.filter(t => t.completed), [filteredTasks]);

  const currentTitle = useMemo(() => {
      if(activeFilter === 'myday') return t('myDay');
      if(activeFilter === 'inbox') return t('inbox');
      if(activeFilter === 'today') return t('today');
      if(activeFilter === 'planned') return t('planned');
      if(activeFilter === 'important') return t('important');
      if(activeFilter.startsWith('proj-')) return projects.find(p => p.id === activeFilter)?.name || t('projects');
      return t('tasks');
  }, [activeFilter, projects, t]);

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newProject: Project = { id: `proj-${Date.now()}`, name: newProjectName.trim(), color: randomColor };
    setProjects(prev => [...prev, newProject]);
    setActiveFilter(newProject.id);
    setNewProjectName('');
    setIsAddingProject(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    
    let projectId = activeFilter.startsWith('proj-') ? activeFilter : projects[0]?.id;
    if (!projectId && projects.length > 0) projectId = projects[0].id;

    const newTask: Task = { 
      id: `task-${Date.now()}`, 
      title: newTaskName.trim(), 
      completed: false, 
      status: 'todo',
      projectId: projectId || 'inbox', 
      priority: 4, 
      tags: [], 
      subtasks: [],
      inMyDay: activeFilter === 'myday',
      deadline: activeFilter === 'today' ? new Date().toISOString().split('T')[0] : undefined
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskName('');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed, status: !t.completed ? 'done' : 'todo' } : t));
  };

  const allTags = useMemo(() => Array.from(new Set(tasks.flatMap(t => t.tags || []))), [tasks]);

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 space-y-1">
             <button onClick={() => setActiveFilter('myday')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'myday' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <Sun size={18} /> {t('myDay')}
             </button>
             <button onClick={() => setActiveFilter('inbox')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'inbox' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <Inbox size={18} /> {t('inbox')}
             </button>
             <button onClick={() => setActiveFilter('today')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'today' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <Calendar size={18} /> {t('today')}
             </button>
             <button onClick={() => setActiveFilter('important')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'important' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <Star size={18} /> {t('important')}
             </button>
             <button onClick={() => setActiveFilter('planned')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'planned' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-500' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <Layers size={18} /> {t('planned')}
             </button>
        </div>
        
        <div className="px-4 py-2 mt-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('projects')}</span>
                <button onClick={() => setIsAddingProject(true)} className="text-gray-400 hover:text-slate-900 dark:hover:text-white"><Plus size={14}/></button>
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                {projects.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => setActiveFilter(p.id)}
                        className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${activeFilter === p.id ? 'bg-gray-100 dark:bg-slate-800 font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span className="truncate">{p.name}</span>
                    </button>
                ))}
                {isAddingProject && (
                    <div className="px-3 py-1">
                        <input 
                            autoFocus
                            type="text" 
                            value={newProjectName} 
                            onChange={e => setNewProjectName(e.target.value)} 
                            onBlur={() => !newProjectName && setIsAddingProject(false)}
                            onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                            placeholder={t('projectNamePlaceholder')}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-slate-700 text-sm focus:outline-none focus:border-[var(--accent-color)]"
                        />
                    </div>
                )}
            </div>
        </div>

        {allTags.length > 0 && (
            <div className="px-4 py-2 mt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">{t('tags')}</span>
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setActiveFilter(`tag-${tag}`)}
                            className={`px-2 py-1 rounded text-xs font-medium border ${activeFilter === `tag-${tag}` ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)]' : 'bg-transparent border-gray-200 dark:border-slate-700 text-gray-500 hover:border-gray-300 dark:hover:border-slate-600'}`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </aside>

      {/* Main Task List */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="flex-shrink-0 px-8 py-6">
             <h1 className="text-3xl font-bold flex items-center gap-3">
                 {currentTitle} 
                 <span className="text-lg font-normal text-gray-400">{new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { weekday: 'short', day: 'numeric' })}</span>
             </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-24 custom-scrollbar">
             {filteredTasks.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                     <CheckSquare size={64} className="mb-4 opacity-10"/>
                     <p>{t('noTasksFound')}</p>
                 </div>
             )}
             
             <div className="space-y-1">
                 {incompleteTasks.map(task => (
                     <div 
                        key={task.id} 
                        onClick={() => setDetailTaskId(task.id)}
                        className={`group flex items-center gap-3 p-3 bg-white dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-slate-700 shadow-sm transition-all cursor-pointer ${detailTaskId === task.id ? 'ring-2 ring-[var(--accent-color)]/50' : ''}`}
                     >
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id); }}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-gray-300 dark:border-slate-600 hover:border-[var(--accent-color)]'}`}
                         >
                         </button>
                         <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                                 <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</span>
                                 {task.priority < 4 && (
                                     <span className={`w-2 h-2 rounded-full ${priorityMap[task.priority as keyof typeof priorityMap].bg}`}></span>
                                 )}
                             </div>
                             <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                 {task.projectId && (
                                     <span className="flex items-center gap-1">
                                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projects.find(p => p.id === task.projectId)?.color || '#ccc' }}></div>
                                         {projects.find(p => p.id === task.projectId)?.name || t('inbox')}
                                     </span>
                                 )}
                                 {task.deadline && (
                                     <span className={`flex items-center gap-1 ${task.deadline < new Date().toISOString().split('T')[0] ? 'text-red-400' : ''}`}>
                                         <Calendar size={10} />
                                         {new Date(task.deadline).toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { month: 'short', day: 'numeric' })}
                                     </span>
                                 )}
                                 {task.subtasks && task.subtasks.length > 0 && (
                                     <span className="flex items-center gap-1">
                                         <Layers size={10} />
                                         {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                     </span>
                                 )}
                             </div>
                         </div>
                         {task.inMyDay && <Sun size={14} className="text-amber-500"/>}
                     </div>
                 ))}
             </div>

             {completedTasks.length > 0 && (
                 <div className="mt-8">
                     <button onClick={() => setIsCompletedVisible(!isCompletedVisible)} className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                         <ChevronDown size={14} className={`transition-transform ${isCompletedVisible ? '' : '-rotate-90'}`}/>
                         {t('completed')} ({completedTasks.length})
                     </button>
                     
                     {isCompletedVisible && (
                         <div className="space-y-1 opacity-60">
                            {completedTasks.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => setDetailTaskId(task.id)}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                >
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id); }}
                                        className="w-5 h-5 rounded-md border-2 bg-gray-400 border-gray-400 flex items-center justify-center text-white"
                                    >
                                        <Check size={12} />
                                    </button>
                                    <span className="text-sm font-medium text-gray-500 line-through decoration-gray-400">{task.title}</span>
                                </div>
                            ))}
                         </div>
                     )}
                 </div>
             )}
        </div>

        <div className="absolute bottom-6 left-8 right-8">
            <form onSubmit={handleAddTask} className="relative shadow-xl rounded-2xl">
                 <Plus size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                 <input 
                    type="text" 
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder={t('addTaskPlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border-0 rounded-2xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--accent-color)] shadow-lg"
                 />
            </form>
        </div>
      </main>

      {/* Detail Pane */}
      {detailTaskId && (
          <TaskDetail 
            taskId={detailTaskId} 
            tasks={tasks} 
            projects={projects} 
            setTasks={setTasks} 
            onClose={() => setDetailTaskId(null)} 
          />
      )}
    </div>
  );
};

export default TaskList;
