// Central Game Engine & Simulation Controller
import { GameState, GameSettings, HighScoreRecord, PlayerStats } from './types';
import { PlayerDrone } from './player';
import { EnemyManager } from './enemy';
import { BossCoreX } from './boss';
import { BuildingManager } from './building';
import { ProjectileSystem } from './projectile';
import { PowerUpManager } from './powerup';
import { ParticleSystem } from './particle';
import { CollisionManager } from './collision';
import { CityBackground } from './cityBackground';
import { InputManager } from './input';
import { soundManager } from './audio';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public state: GameState = 'START';
  public settings: GameSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    screenShake: true,
    glowEffects: true,
    autoFire: false,
    showFps: false,
  };

  // Systems
  public player: PlayerDrone;
  public enemyManager: EnemyManager;
  public boss: BossCoreX;
  public buildingManager: BuildingManager;
  public projectileSystem: ProjectileSystem;
  public powerUpManager: PowerUpManager;
  public particleSystem: ParticleSystem;
  public collisionManager: CollisionManager;
  public cityBackground: CityBackground;
  public inputManager: InputManager;

  // Wave & Spawning Director
  public waveTimer = 0;
  public spawnTimer = 0;
  public enemiesRemainingInWave = 0;
  public currentLevel = 1;
  public isBossWave = false;

  // Screen Shake & Camera
  private shakeIntensity = 0;
  private shakeDecay = 5;

  // Frame timing
  private lastTime = 0;
  private animFrameId: number | null = null;
  public fps = 60;
  private frameCount = 0;
  private fpsTimer = 0;

  // High Scores in localStorage
  public highScores: HighScoreRecord[] = [];
  public currentHighScore = 0;
  public isNewHighScore = false;

  // UI Event Callback
  public onStateChange?: (state: GameState) => void;
  public onStatsUpdate?: (stats: PlayerStats, level: number, bossActive: boolean, bossHp: number, bossMaxHp: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;

    // Initialize systems
    const w = canvas.width;
    const h = canvas.height;

    this.player = new PlayerDrone(w / 2, h / 2);
    this.enemyManager = new EnemyManager();
    this.boss = new BossCoreX();
    this.buildingManager = new BuildingManager(w, h);
    this.projectileSystem = new ProjectileSystem();
    this.powerUpManager = new PowerUpManager();
    this.particleSystem = new ParticleSystem();
    this.collisionManager = new CollisionManager();
    this.cityBackground = new CityBackground(w, h);
    this.inputManager = new InputManager();
    this.inputManager.bindCanvas(canvas);

    this.loadHighScores();
    this.setupInputHooks();
  }

  private setupInputHooks() {
    this.inputManager.onEMP = () => {
      if (this.state === 'PLAYING') {
        const fired = this.player.activateEMP(this.particleSystem);
        if (fired) {
          this.triggerScreenShake(8);
          this.collisionManager.handleEMP(
            this.player.x,
            this.player.y,
            320,
            this.enemyManager,
            this.projectileSystem,
            this.boss,
            this.particleSystem,
            this.player
          );
        }
      }
    };

    this.inputManager.onShield = () => {
      if (this.state === 'PLAYING') {
        this.player.activateShield(this.particleSystem);
      }
    };

    this.inputManager.onPause = () => {
      if (this.state === 'PLAYING') {
        this.setState('PAUSED');
      } else if (this.state === 'PAUSED') {
        this.setState('PLAYING');
      }
    };
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.cityBackground.resize(width, height);
    this.buildingManager.resize(width, height);
  }

  public start() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.inputManager.init();
    this.inputManager.bindCanvas(this.canvas);
    this.setupInputHooks();
    this.lastTime = performance.now();
    soundManager.startMusic();
    this.gameLoop(this.lastTime);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundManager.stopMusic();
    this.inputManager.destroy();
  }

  public setState(newState: GameState) {
    this.state = newState;
    if (this.onStateChange) this.onStateChange(newState);
  }

  public startNewGame() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.currentLevel = 1;
    this.isBossWave = false;
    this.isNewHighScore = false;
    this.player.reset(w / 2, h / 2);
    this.enemyManager.clear();
    this.projectileSystem.clear();
    this.powerUpManager.clear();
    this.particleSystem.clear();
    this.boss.active = false;
    this.buildingManager.resize(w, h);
    this.inputManager.reset();

    this.prepareWave(1);
    this.setState('PLAYING');
    soundManager.init();
    soundManager.startMusic();

    this.particleSystem.addFloatingText(w / 2, h / 2 - 60, 'DEFEND THE SMART CITY!', '#06b6d4');
  }

  private prepareWave(level: number) {
    this.currentLevel = level;
    this.player.stats.level = level;
    this.isBossWave = level % 5 === 0;
    this.spawnTimer = 0;

    if (this.isBossWave) {
      this.enemiesRemainingInWave = 4 + level * 2;
      this.boss.spawn(level, this.canvas.width);
      this.triggerScreenShake(12);
      this.particleSystem.addFloatingText(
        this.canvas.width / 2,
        this.canvas.height / 2 - 80,
        'WARNING: CORE-X DREADNOUGHT DETECTED!',
        '#ef4444'
      );
    } else {
      this.boss.active = false;
      this.enemiesRemainingInWave = 8 + level * 4;
      this.particleSystem.addFloatingText(
        this.canvas.width / 2,
        this.canvas.height / 2 - 80,
        `SECTOR WAVE ${level}`,
        '#38bdf8'
      );

      // Immediately spawn first 2 vanguard drones so there is immediate movement/action
      this.spawnSingleEnemy(this.canvas.width, this.canvas.height);
      this.spawnSingleEnemy(this.canvas.width, this.canvas.height);
      this.enemiesRemainingInWave = Math.max(0, this.enemiesRemainingInWave - 2);
    }
  }

  public triggerScreenShake(intensity: number) {
    if (this.settings.screenShake) {
      this.shakeIntensity = Math.min(25, this.shakeIntensity + intensity);
    }
  }

  private gameLoop = (currentTime: number) => {
    this.animFrameId = requestAnimationFrame(this.gameLoop);

    const dt = Math.max(0.001, Math.min((currentTime - this.lastTime) / 1000, 0.1));
    this.lastTime = currentTime;

    // FPS Meter
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    // Always animate living smart city backdrop (moving cars, billboards)
    this.cityBackground.update(dt);

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();
  };

  private update(dt: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Screen Shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt * 15);
    }

    // 2. City Background
    this.cityBackground.update(dt);

    // 3. Buildings Update & Proximity check for Energy Core boost
    this.buildingManager.update(dt, this.particleSystem);
    const activeBuildingsCount = this.buildingManager.getActiveBuildingsCount();

    // Check if player is standing near Energy Core
    const energyCore = this.buildingManager.getBuildings().find((b) => b.type === 'ENERGY_CORE');
    const nearEnergyCore =
      energyCore &&
      !energyCore.destroyed &&
      Math.hypot(this.player.x - energyCore.x, this.player.y - energyCore.y) < 140;

    // 4. Player Update
    const autoShoot = this.settings.autoFire || this.inputManager.isShooting;
    this.player.handleInput(
      this.inputManager.moveDir,
      this.inputManager.aimPos,
      autoShoot,
      dt,
      this.projectileSystem,
      this.particleSystem,
      nearEnergyCore
    );
    this.player.update(dt, w, h);

    // 5. Enemies & Spawner Director
    this.updateSpawner(dt, w, h);
    this.enemyManager.update(
      dt,
      this.player.x,
      this.player.y,
      this.buildingManager,
      this.projectileSystem,
      this.particleSystem
    );

    // 6. Boss Update
    if (this.boss.active) {
      this.boss.update(
        dt,
        this.player.x,
        this.player.y,
        w,
        h,
        this.projectileSystem,
        this.particleSystem,
        this.enemyManager
      );
    }

    // 7. Projectiles & Powerups & Particles
    this.projectileSystem.update(dt, w, h);
    this.powerUpManager.update(dt, this.player.x, this.player.y);
    this.particleSystem.update(dt);

    // 8. Collisions
    this.collisionManager.checkAll(
      this.player,
      this.projectileSystem,
      this.enemyManager,
      this.boss,
      this.buildingManager,
      this.powerUpManager,
      this.particleSystem,
      (scoreVal) => {
        // Extra feedback for score
      }
    );

    // 9. Loss Condition Check
    if (this.player.stats.health <= 0 || activeBuildingsCount === 0) {
      this.handleGameOver();
      return;
    }

    // 10. Wave Progress / Next Level check
    if (
      this.enemiesRemainingInWave <= 0 &&
      this.enemyManager.getEnemies().length === 0 &&
      (!this.boss.active || this.boss.health <= 0)
    ) {
      this.waveTimer += dt;
      if (this.waveTimer > 2.0) {
        this.waveTimer = 0;
        this.prepareWave(this.currentLevel + 1);
        // Wave clear reward
        this.player.stats.health = Math.min(this.player.stats.maxHealth, this.player.stats.health + 20);
        this.particleSystem.addFloatingText(w / 2, h / 2 - 40, 'SECTOR CLEARED! +20 HP', '#10b981');
      }
    }

    // 11. Send stats to React UI
    if (this.onStatsUpdate) {
      this.onStatsUpdate(
        this.player.stats,
        this.currentLevel,
        this.boss.active,
        this.boss.health,
        this.boss.maxHealth
      );
    }
  }

  private spawnSingleEnemy(width: number, height: number) {
    // Random edge spawn location
    let spawnX = 0;
    let spawnY = 0;
    const edge = Math.floor(Math.random() * 4);

    switch (edge) {
      case 0: // Top
        spawnX = Math.random() * width;
        spawnY = -20;
        break;
      case 1: // Right
        spawnX = width + 20;
        spawnY = Math.random() * height;
        break;
      case 2: // Bottom
        spawnX = Math.random() * width;
        spawnY = height + 20;
        break;
      case 3: // Left
        spawnX = -20;
        spawnY = Math.random() * height;
        break;
    }

    // Determine enemy type based on probability and wave level
    let type: 'SCOUT' | 'HUNTER' | 'TANK' | 'HACKER' = 'SCOUT';
    const rand = Math.random();

    if (this.currentLevel >= 4 && rand < 0.25) {
      type = 'TANK';
    } else if (this.currentLevel >= 3 && rand < 0.5) {
      type = 'HACKER';
    } else if (this.currentLevel >= 2 && rand < 0.75) {
      type = 'HUNTER';
    } else {
      type = 'SCOUT';
    }

    this.enemyManager.spawn(type, spawnX, spawnY, this.currentLevel);
  }

  private updateSpawner(dt: number, width: number, height: number) {
    if (this.enemiesRemainingInWave <= 0) return;

    this.spawnTimer += dt;
    const spawnInterval = Math.max(0.6, 2.2 - this.currentLevel * 0.15);

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.enemiesRemainingInWave--;
      this.spawnSingleEnemy(width, height);
    }
  }

  private handleGameOver() {
    this.setState('GAME_OVER');
    soundManager.playExplosion(true);
    this.triggerScreenShake(20);

    // High score check & save
    const currentScore = this.player.stats.score;
    if (currentScore > this.currentHighScore) {
      this.currentHighScore = currentScore;
      this.isNewHighScore = true;
    }

    const newRecord: HighScoreRecord = {
      score: currentScore,
      level: this.currentLevel,
      enemiesKilled: this.player.stats.enemiesDestroyed,
      date: new Date().toLocaleDateString(),
    };

    this.highScores.unshift(newRecord);
    this.highScores = this.highScores.slice(0, 10);
    this.saveHighScores();
  }

  private loadHighScores() {
    try {
      const stored = localStorage.getItem('neon_city_defender_highscores');
      if (stored) {
        this.highScores = JSON.parse(stored);
        if (this.highScores.length > 0) {
          this.currentHighScore = Math.max(...this.highScores.map((h) => h.score));
        }
      }
    } catch {
      this.highScores = [];
    }
  }

  private saveHighScores() {
    try {
      localStorage.setItem('neon_city_defender_highscores', JSON.stringify(this.highScores));
    } catch {
      // LocalStorage error fallback
    }
  }

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Screen Shake Transform
    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. City Background
    this.cityBackground.render(ctx, this.settings.glowEffects);

    // 2. Protected Buildings
    this.buildingManager.render(ctx, this.settings.glowEffects);

    // 3. Power-ups
    this.powerUpManager.render(ctx, this.settings.glowEffects);

    // 4. Enemy Drones
    this.enemyManager.render(ctx, this.settings.glowEffects);

    // 5. Boss CORE-X
    if (this.boss.active) {
      this.boss.render(ctx, this.settings.glowEffects);
    }

    // 6. Projectiles (Player & Enemies)
    this.projectileSystem.render(ctx, this.settings.glowEffects);

    // 7. Player Drone
    if (this.player.stats.health > 0) {
      this.player.render(ctx, this.settings.glowEffects);
    }

    // 8. Particles & Shockwaves & Floating Combat Text
    this.particleSystem.render(ctx, this.settings.glowEffects);

    // 9. Reticle / Aim Pointer Guide
    if (this.state === 'PLAYING') {
      const aim = this.inputManager.aimPos;
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(aim.x, aim.y, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(aim.x - 12, aim.y);
      ctx.lineTo(aim.x - 4, aim.y);
      ctx.moveTo(aim.x + 4, aim.y);
      ctx.lineTo(aim.x + 12, aim.y);
      ctx.moveTo(aim.x, aim.y - 12);
      ctx.lineTo(aim.x, aim.y - 4);
      ctx.moveTo(aim.x, aim.y + 4);
      ctx.lineTo(aim.x, aim.y + 12);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
