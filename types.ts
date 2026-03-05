
export enum AppModule {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  POMODORO = 'POMODORO',
  SOCIAL = 'SOCIAL',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  CALCULATOR = 'CALCULATOR',
  NOTES = 'NOTES',
  WEATHER = 'WEATHER',
  CALENDAR = 'CALENDAR',
  GOALS = 'GOALS',
  MUSIC = 'MUSIC',
  FLASHCARDS = 'FLASHCARDS',
}

export type Language = 'en' | 'jp' | 'cn' | 'es' | 'fr' | 'de' | 'kr' | 'pt' | 'it' | 'ru' | 'ar';

export interface WindowConfig {
  id: AppModule;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  preMaximizeState?: { x: number; y: number; width: number; height: number; };
  isClosing?: boolean;
}
export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Link {
  id: string;
  url: string;
}

export interface Counter {
  id: string;
  name: string;
  count: number;
  target: number;
}

export type Priority = 1 | 2 | 3 | 4;

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: TaskStatus; 
  projectId: string;
  priority: Priority; // P1 (High) to P4 (None)
  tags: string[];
  subtasks?: Subtask[];
  deadline?: string; // ISO Date string
  deadlineTime?: string; // HH:mm
  notes?: string;
  links?: Link[];
  counters?: Counter[];
  classId?: string; 
  inMyDay?: boolean; // Microsoft To Do style "My Day"
  timeSpent?: number; // Total seconds focused on this task
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'none';
  attachments?: string[];
}


export interface TimeEntry {
  id: string;
  description: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
  project: string;
}

export interface ActiveTimer {
  startTime: number;
  description: string;
  project: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  title: string;
  moodRatings?: Record<string, number>;
  mood: 'happy' | 'neutral' | 'focused' | 'tired';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  isAwaitingConfirmation?: boolean;
  functionCall?: { id: string; name: string; args: Record<string, unknown>; };
  isConfirmed?: boolean;
  isCancelled?: boolean;
}

export interface Note {
  id:string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  mood?: 'happy' | 'neutral' | 'focused' | 'tired';
}

export interface Event {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  description?: string;
  location?: string;
}

export interface Goal {
  id: string;
  title: string;
  color: string;
  icon: string;
  streak: number;
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
  targetDaysPerWeek: number;
}

export interface ClassSession {
    dayOfWeek: number; // 0=Sun, 1=Mon, etc.
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    room?: string;
}

export interface Class {
    id: string;
    name: string;
    instructor: string;
    color: string;
    sessions: ClassSession[];
    location?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  box: number; // Leitner system (0-5)
  nextReview: number; // timestamp
}

export interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
}
