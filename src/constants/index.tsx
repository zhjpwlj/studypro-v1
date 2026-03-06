import React from 'react';
import { LayoutDashboard, CheckSquare, Clock as PomodoroIcon, Users, Settings, BrainCircuit, Calculator, NotebookText, CloudSun, Calendar as CalendarIcon, Target, Music as MusicIcon, Layers } from 'lucide-react';
import { AppModule } from '../types';

export const appIcons: Record<string, React.ElementType> = {
  [AppModule.DASHBOARD]: LayoutDashboard,
  [AppModule.TASKS]: CheckSquare,
  [AppModule.POMODORO]: PomodoroIcon,
  [AppModule.SOCIAL]: Users,
  [AppModule.CHAT]: BrainCircuit,
  [AppModule.SETTINGS]: Settings,
  [AppModule.CALCULATOR]: Calculator,
  [AppModule.NOTES]: NotebookText,
  [AppModule.WEATHER]: CloudSun,
  [AppModule.CALENDAR]: CalendarIcon,
  [AppModule.GOALS]: Target,
  [AppModule.MUSIC]: MusicIcon,
  [AppModule.FLASHCARDS]: Layers,
};
