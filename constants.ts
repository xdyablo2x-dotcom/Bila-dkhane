
import { UserLevel, HealthMilestone } from './types.ts';

export const STORAGE_KEY = 'bila_elite_v2_final';

export const LEVEL_DATA = [
  { level: 1, title: UserLevel.NOVICE, minXp: 0, maxXp: 100 },
  { level: 2, title: UserLevel.INITIATED, minXp: 100, maxXp: 300 },
  { level: 3, title: UserLevel.GUARDIAN, minXp: 300, maxXp: 1000 },
  { level: 4, title: UserLevel.LEGEND, minXp: 1000, maxXp: 10000 },
];

export const HEALTH_MILESTONES: HealthMilestone[] = [
  { id: 'm1', label: 'Cœur & Tension', description: 'Le pouls redevient normal.', daysRequired: 0.04 },
  { id: 'm2', label: 'Oxygénation', description: 'Le CO sanguin diminue de moitié.', daysRequired: 0.33 },
  { id: 'm3', label: 'Désintox CO', description: 'Le CO est totalement éliminé.', daysRequired: 1 },
  { id: 'm4', label: 'Goût & Odorat', description: 'Les sens s\'affinent.', daysRequired: 2 },
  { id: 'm5', label: 'Respiration', description: 'Les bronches se relâchent.', daysRequired: 3 },
  { id: 'm6', label: 'Circulation', description: 'Marcher devient plus facile.', daysRequired: 14 },
  { id: 'm7', label: 'Capacité Pulmonaire', description: 'Régénération structurelle.', daysRequired: 30 },
];

export const getHealthMessage = (days: number): string => {
  if (days === 0) return "Amorçage : Préparation à la détoxification profonde.";
  if (days < 1) return "Oxygénation : Le CO est évacué de votre système.";
  if (days < 3) return "Restauration nerveuse : Les terminaisons commencent à repousser.";
  if (days < 14) return "Bio-résilience : Circulation sanguine optimisée.";
  return "Excellence métabolique : Vos poumons se régénèrent.";
};
