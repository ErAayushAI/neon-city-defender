export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'HOW_TO_PLAY' | 'SETTINGS';

export interface Vector2D {
  x: number;
  y: number;
}

export type EnemyType = 'SCOUT' | 'HUNTER' | 'TANK' | 'HACKER';

export type PowerUpType = 'HEALTH' | 'ENERGY' | 'RAPID_FIRE' | 'SHIELD' | 'EMP_RECHARGE' | 'SCORE_MULTIPLIER';

export interface BuildingData {
  id: string;
  name: string;
  type: 'ENERGY_CORE' | 'COMM_TOWER' | 'CONTROL_CENTER';
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  destroyed: boolean;
  hackedProgress: number; // 0 to 100
  color: string;
  description: string;
  bonusText: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  score: number;
  combo: number;
  comboMultiplier: number;
  comboTimer: number; // in seconds
  maxComboTimer: number;
  level: number;
  empCooldown: number;
  empMaxCooldown: number;
  shieldActive: boolean;
  shieldTimeRemaining: number;
  shieldMaxDuration: number;
  rapidFireActive: boolean;
  rapidFireTimeRemaining: number;
  scoreMultiplierActive: boolean;
  scoreMultiplierTimeRemaining: number;
  enemiesDestroyed: number;
  bossesDefeated: number;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  screenShake: boolean;
  glowEffects: boolean;
  autoFire: boolean;
  showFps: boolean;
}

export interface HighScoreRecord {
  score: number;
  level: number;
  date: string;
  enemiesKilled: number;
}
