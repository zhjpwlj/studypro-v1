
import React, { useState } from 'react';
import { Class, ClassSession } from '../types';
import { Plus, Trash2, Clock, MapPin, User, CalendarDays, X } from 'lucide-react';

interface ClassScheduleProps {
  classes: Class[];
  onAddClass: (cls: Class) => void;
  onDeleteClass: (id: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

const ClassSchedule: React.FC<ClassScheduleProps> = ({ classes, onAddClass, onDeleteClass }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  // Temporary session state for the form
  const [tempDay, setTempDay] = useState(1);
  const [tempStart, setTempStart] = useState('09:00');
  const [tempEnd, setTempEnd] = useState('10:30');

  const handleAddSession = () => {
    setSessions([...sessions, { dayOfWeek: tempDay, startTime: tempStart, endTime: tempEnd }]);
  };

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClass: Class = {
      id: `class-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      name,
      instructor,
      location,
      color,
      sessions: sessions.length > 0 ? sessions : [{ dayOfWeek: tempDay, startTime: tempStart, endTime: tempEnd }]
    };

    onAddClass(newClass);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setInstructor('');
    setLocation('');
    setSessions([]);
    setColor(COLORS[0]);
  };

  // Sort classes by day and time for the list view
  const getClassesForDay = (dayIndex: number) => {
    return classes.flatMap(c => 
      c.sessions
        .filter(s => s.dayOfWeek === dayIndex)
        .map(s => ({ ...c, session: s }))
    ).sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white relative">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold">Class Schedule</h2>
           <p className="text-sm text-gray-500">Manage your academic timetable</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--accent-color)] text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {DAYS.map((day, index) => {
          const todaysClasses = getClassesForDay(index);
          if (todaysClasses.length === 0) return null;

          return (
            <div key={day} className="animate-fade-in">
              <h3 className="font-bold text-gray-500 text-sm mb-3 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800 pb-1">{day}</h3>
              <div className="space-y-3">
                {todaysClasses.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-stretch bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="w-2" style={{ backgroundColor: item.color }}></div>
                    <div className="p-3 flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg">{item.name}</h4>
                        <button onClick={() => onDeleteClass(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400"/>
                          <span>{item.session.startTime} - {item.session.endTime}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-gray-400"/>
                            <span>{item.location}</span>
                          </div>
                        )}
                        {item.instructor && (
                          <div className="flex items-center gap-1.5">
                             <User size={14} className="text-gray-400"/>
                             <span>{item.instructor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {classes.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 mt-12">
                 <CalendarDays size={64} className="mb-4"/>
                 <p>No classes scheduled.</p>
             </div>
        )}
      </div>

      {/* Add Class Modal Overlay */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="font-bold text-lg">Add New Class</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Physics 101"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:ring-2 focus:ring-[var(--accent-color)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instructor</label>
                    <input 
                      type="text" 
                      value={instructor}
                      onChange={e => setInstructor(e.target.value)}
                      placeholder="e.g. Dr. Smith"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                    <input 
                      type="text" 
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Room 304"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5"
                    />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Schedule</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {sessions.map((s, i) => (
                        <div key={i} className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded text-xs flex items-center gap-2">
                            <span>{DAYS[s.dayOfWeek]} {s.startTime}-{s.endTime}</span>
                            <button type="button" onClick={() => removeSession(i)} className="text-red-500 hover:text-red-600"><X size={12}/></button>
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    <select 
                        value={tempDay} 
                        onChange={e => setTempDay(Number(e.target.value))}
                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                    >
                        {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                    <input 
                        type="time" 
                        value={tempStart} 
                        onChange={e => setTempStart(e.target.value)}
                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                    />
                    <input 
                        type="time" 
                        value={tempEnd} 
                        onChange={e => setTempEnd(e.target.value)}
                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                    />
                </div>
                <button type="button" onClick={handleAddSession} className="text-xs text-[var(--accent-color)] font-medium mt-2 hover:underline">+ Add another session</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                        <button 
                            type="button"
                            key={c}
                            onClick={() => setColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-gray-400' : 'hover:scale-105'}`}
                        />
                    ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium">Cancel</button>
                 <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[var(--accent-color)] text-white font-bold hover:brightness-110 transition-all">Save Class</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSchedule;
