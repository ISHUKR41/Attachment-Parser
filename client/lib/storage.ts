import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, createInitialGameState } from './chessLogic';
import { Difficulty } from './chessAI';

const KEYS = {
  SAVED_GAME: '@chess_saved_game',
  PLAYER_STATS: '@chess_player_stats',
  SETTINGS: '@chess_settings',
};

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  totalPoints: number;
  highestPoints: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  defaultDifficulty: Difficulty;
}

export interface SavedGame {
  gameState: GameState;
  gameMode: 'pvp' | 'ai';
  difficulty?: Difficulty;
  playerColor?: 'white' | 'black';
  whitePoints: number;
  blackPoints: number;
  savedAt: string;
}

const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  gamesDrawn: 0,
  totalPoints: 0,
  highestPoints: 0,
};

const defaultSettings: GameSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  defaultDifficulty: 'medium',
};

export async function saveGame(game: SavedGame): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SAVED_GAME, JSON.stringify(game));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

export async function loadGame(): Promise<SavedGame | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SAVED_GAME);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load game:', error);
  }
  return null;
}

export async function deleteSavedGame(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SAVED_GAME);
  } catch (error) {
    console.error('Failed to delete saved game:', error);
  }
}

export async function getPlayerStats(): Promise<PlayerStats> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PLAYER_STATS);
    if (data) {
      return { ...defaultStats, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to load player stats:', error);
  }
  return defaultStats;
}

export async function updatePlayerStats(update: Partial<PlayerStats>): Promise<void> {
  try {
    const current = await getPlayerStats();
    const updated = { ...current, ...update };
    await AsyncStorage.setItem(KEYS.PLAYER_STATS, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update player stats:', error);
  }
}

export async function recordGameResult(
  result: 'win' | 'loss' | 'draw',
  points: number
): Promise<void> {
  const stats = await getPlayerStats();
  stats.gamesPlayed += 1;
  stats.totalPoints += points;
  
  if (points > stats.highestPoints) {
    stats.highestPoints = points;
  }

  switch (result) {
    case 'win':
      stats.gamesWon += 1;
      break;
    case 'loss':
      stats.gamesLost += 1;
      break;
    case 'draw':
      stats.gamesDrawn += 1;
      break;
  }

  await updatePlayerStats(stats);
}

export async function getSettings(): Promise<GameSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

export async function updateSettings(update: Partial<GameSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...update };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update settings:', error);
  }
}
