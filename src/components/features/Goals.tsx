
import React, { useState, useContext } from 'react';
import { Goal } from '../../types';
import { Target, Plus, Trash2, CheckCircle2, Flame, Trophy } from 'lucide-react';
import { LanguageContext } from '../../contexts/LanguageContext';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
}

const ICONS = ['🎯', '💧', '🏃', '📚', '🧘', '💊', '💰', '🥦'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onToggleGoal, onDeleteGoal }) => {
  const { t, language } = useContext(LanguageContext);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState(ICONS[0]);
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddGoal({
      title: newTitle,
      color: newColor,
      icon: newIcon,
      streak: 0,
      completedDates: [],
      targetDaysPerWeek: 7
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const getLast7Days = () => {
      const dates = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d);
      }
      return dates;
  };

  const last7Days = getLast7Days();
  const todayStr = new Date().toISOString().split('T')[0];

  const toggleHabitForToday = (goal: Goal) => {
      // Logic for toggling today specifically. 
      // The parent prop `onToggleGoal` handles logic, we assume it toggles 'today'.
      // If we need to toggle specific past days, we'd need a more complex update function.
      // For now, let's keep it simple: the main check button toggles Today.
      onToggleGoal(goal.id);
  };

  const isCompletedOn = (goal: Goal, dateStr: string) => {
      return goal.completedDates.includes(dateStr);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="text-[var(--accent-color)]" /> {t('habitTracker')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('habitSubtitle')}</p>
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Plus size={18} /> {t('newHabit')}
          </button>
      </div>

      {isAdding && (
          <div className="p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 animate-slide-in-right">
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
                  <input 
                      type="text" 
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder={t('habitNamePlaceholder')}
                      className="w-full text-lg font-bold bg-transparent border-b-2 border-gray-200 dark:border-slate-700 focus:border-[var(--accent-color)] focus:outline-none px-2 py-1"
                      autoFocus
                  />
                  <div className="flex gap-4 items-center">
                      <div className="flex gap-2">
                          {ICONS.map(icon => (
                              <button type="button" key={icon} onClick={() => setNewIcon(icon)} className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 ${newIcon === icon ? 'ring-2 ring-[var(--accent-color)]' : ''}`}>{icon}</button>
                          ))}
                      </div>
                      <div className="w-px h-8 bg-gray-200 dark:bg-slate-700"></div>
                      <div className="flex gap-2">
                           {COLORS.map(color => (
                              <button type="button" key={color} onClick={() => setNewColor(color)} className={`w-6 h-6 rounded-full ${newColor === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-gray-400' : ''}`} style={{ backgroundColor: color }}></button>
                          ))}
                      </div>
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">{t('cancel')}</button>
                      <button type="submit" disabled={!newTitle.trim()} className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-lg font-bold hover:brightness-110 disabled:opacity-50">{t('create')}</button>
                  </div>
              </form>
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Target size={64} className="mb-4 opacity-20"/>
                  <p className="font-medium text-lg">{t('noHabits')}</p>
                  <p className="text-sm">{t('startSmall')}</p>
              </div>
          ) : (
              goals.map(goal => {
                  const isDoneToday = goal.completedDates.includes(todayStr);
                  return (
                      <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6 group">
                          <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                              <button 
                                  onClick={() => toggleHabitForToday(goal)}
                                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-all duration-300 ${isDoneToday ? 'bg-gradient-to-br from-[var(--accent-color)] to-purple-600 text-white scale-105' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                              >
                                  {goal.icon}
                              </button>
                              <div>
                                  <h3 className={`text-lg font-bold ${isDoneToday ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{goal.title}</h3>
                                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mt-1">
                                      <span className="flex items-center gap-1 text-orange-500"><Flame size={12} fill="currentColor"/> {goal.streak} {t('dayStreak')}</span>
                                      <span>•</span>
                                      <span className="text-gray-400">{t('targetEveryday')}</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                              {last7Days.map((date, i) => {
                                  const dStr = date.toISOString().split('T')[0];
                                  const isDone = isCompletedOn(goal, dStr);
                                  
                                  return (
                                      <div key={i} className="flex flex-col items-center gap-1">
                                          <span className="text-[10px] font-bold text-gray-400 uppercase">{date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'jp' ? 'ja-JP' : 'zh-CN', { weekday: 'narrow' })}</span>
                                          <div 
                                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDone ? 'text-white' : 'bg-gray-100 dark:bg-slate-700/50 text-transparent'}`}
                                              style={{ backgroundColor: isDone ? goal.color : undefined }}
                                          >
                                              <CheckCircle2 size={16} />
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>

                          <button onClick={() => onDeleteGoal(goal.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100">
                              <Trash2 size={18} />
                          </button>
                      </div>
                  );
              })
          )}
      </div>
    </div>
  );
};

export default Goals;
