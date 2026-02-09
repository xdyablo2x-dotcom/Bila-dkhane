
export enum UserLevel {
  NOVICE = 'NOVICE',
  INITIATED = 'INITIÉ',
  GUARDIAN = 'GARDIEN',
  LEGEND = 'LÉGENDE'
}

export type AppLanguage = 'fr' | 'ar' | 'en' | 'es';

export interface AppConfig {
  cigPerDay: number;
  packPrice: number;
  wishName: string;
  wishPrice: number;
  language: AppLanguage;
  targetDays: number; // Nouveau: Nombre de jours cibles pour le sevrage
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface CravingLog {
  timestamp: number;
  trigger: string;
  intensity: number;
  advice: string;
}

export interface MoodLog {
  timestamp: number;
  value: number;
}

export interface DailyMission {
  id: string;
  task: string;
  completed: boolean;
  xpReward: number;
}

export interface AppState {
  firstName: string;
  lastName: string;
  days: number;
  xp: number;
  level: number;
  config: AppConfig;
  lastCheckIn: string | null;
  checkInHistory: number[];
  lifeMinutesGained: number;
  streak: number;
  longestStreak: number;
  cravingLogs: CravingLog[];
  moodLogs: MoodLog[];
  currentMission: DailyMission;
  wishImageUrl?: string;
}

export interface HealthMilestone {
  id: string;
  label: string;
  description: string;
  daysRequired: number;
}
