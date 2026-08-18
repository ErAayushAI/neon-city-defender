// Boss "CORE-X" AI and Multi-Stage Combat System
import { ParticleSystem } from './particle';
import { ProjectileSystem } from './projectile';
import { EnemyManager } from './enemy';
import { soundManager } from './audio';

export class BossCoreX {
  public active: boolean = false;
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public angle: number = 0;
  public radius: number = 55;
  public health: number = 1800;
  public maxHealth: number = 1800;
  public scoreValue: number = 2500;
  public level: number = 5;

  private attackTimer: number = 0;
  private attackPhase: number = 1;
  private spiralAngle: number = 0;
  private hitFlash: number = 0;
  private shieldAngle: number = 0;
  private laserChargeTimer: number = 0;
  private isLaserCharging: boolean = false;

  public spawn(level: number, canvasWidth: number) {
    this.active = true;
    this.level = level;
    this.x = canvasWidth / 2;
    this.y = -80; // Fly in from above
    this.vx = 0;
    this.vy = 80;
    this.maxHealth = 1800 + (level - 5) * 600;
    this.health = this.maxHealth;
    this.scoreValue = 2500 + level * 200;
    this.attackTimer = 0;
    this.attackPhase = 1;
    this.spiralAngle = 0;
    this.hitFlash = 0;
    this.isLaserCharging = false;
    this.laserChargeTimer = 0;

    soundManager.playBossAlarm();
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    canvasWidth: number,
    canvasHeight: number,
    projectiles: ProjectileSystem,
    particles: ParticleSystem,
    enemyManager: EnemyManager
  ) {
    if (!this.active) return;

    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.shieldAngle += dt * 2.5;

    // Phase threshold detection
    const hpRatio = this.health / this.maxHealth;
    if (hpRatio < 0.25) {
      this.attackPhase = 3; // Enraged
    } else if (hpRatio < 0.6) {
      this.attackPhase = 2; // Berserk & Minions
    } else {
      this.attackPhase = 1; // Standard
    }

    // Entrance sequence
    if (this.y < 130) {
      this.y += 120 * dt;
      return;
    }

    // Boss Hover & Tracking Movement
    const targetX = playerX;
    const targetY = Math.min(220, playerY * 0.4 + 80);
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    const moveSpeed = this.attackPhase === 3 ? 120 : 70;
    this.vx += (dx * 0.5 - this.vx) * Math.min(1, dt * 2);
    this.vy += (dy * 0.5 - this.vy) * Math.min(1, dt * 2);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Bounds clamping
    this.x = Math.max(this.radius + 20, Math.min(canvasWidth - this.radius - 20, this.x));
    this.y = Math.max(this.radius + 20, Math.min(canvasHeight * 0.45, this.y));

    this.angle = Math.atan2(playerY - this.y, playerX - this.x);

    // Thrusters
    particles.emitThrusterTrail(this.x - 30, this.y - 30, Math.PI * 0.5, '#ef4444');
    particles.emitThrusterTrail(this.x + 30, this.y - 30, Math.PI * 0.5, '#ef4444');

    // Attack Patterns
    this.attackTimer += dt;
    this.spiralAngle += dt * 3.5;

    // Attack Pattern 1: Continuous Spiral Orbs
    if (this.attackTimer > (this.attackPhase === 3 ? 0.35 : 0.6)) {
      this.attackTimer = 0;

      const orbSpeed = 5.5;
      const vx = Math.cos(this.spiralAngle) * orbSpeed;
      const vy = Math.sin(this.spiralAngle) * orbSpeed;

      projectiles.spawn(this.x, this.y, vx, vy, 18, 'BOSS', {
        radius: 8,
        color: '#d946ef',
        glowColor: '#ec4899',
      });

      // Counter-spiral orb
      const cvx = Math.cos(-this.spiralAngle) * orbSpeed;
      const cvy = Math.sin(-this.spiralAngle) * orbSpeed;
      projectiles.spawn(this.x, this.y, cvx, cvy, 18, 'BOSS', {
        radius: 8,
        color: '#06b6d4',
        glowColor: '#38bdf8',
      });

      soundManager.playEnemyLaser();
    }

    // Attack Pattern 2: Heavy Aimed Burst (Every 2.2s)
    if (Math.floor(Date.now() / 2200) % 2 === 0 && Math.random() < 0.08) {
      const aimAngle = Math.atan2(playerY - this.y, playerX - this.x);
      const bSpeed = 9;

      projectiles.spawn(this.x - 25, this.y + 15, Math.cos(aimAngle - 0.15) * bSpeed, Math.sin(aimAngle - 0.15) * bSpeed, 28, 'BOSS', {
        radius: 11,
        color: '#ef4444',
        glowColor: '#f87171',
      });
      projectiles.spawn(this.x + 25, this.y + 15, Math.cos(aimAngle + 0.15) * bSpeed, Math.sin(aimAngle + 0.15) * bSpeed, 28, 'BOSS', {
        radius: 11,
        color: '#ef4444',
        glowColor: '#f87171',
      });
    }

    // Minion Spawn (Phase 2 & 3)
    if (this.attackPhase >= 2 && Math.random() < 0.008) {
      if (enemyManager.getEnemies().length < 10) {
        enemyManager.spawn('SCOUT', this.x + (Math.random() - 0.5) * 100, this.y + 40, this.level);
        particles.emitSparks(this.x, this.y + 40, '#a855f7', 8);
      }
    }

    // Phase 3 Enraged 360-Degree Nova Burst (Periodic)
    if (this.attackPhase === 3 && Math.random() < 0.02) {
      const bullets = 10;
      for (let b = 0; b < bullets; b++) {
        const bAngle = (b / bullets) * Math.PI * 2 + this.shieldAngle;
        projectiles.spawn(
          this.x,
          this.y,
          Math.cos(bAngle) * 6,
          Math.sin(bAngle) * 6,
          20,
          'BOSS',
          { radius: 7, color: '#f59e0b', glowColor: '#fbbf24' }
        );
      }
      particles.emitSparks(this.x, this.y, '#f59e0b', 12);
    }
  }

  public takeDamage(damage: number, particles: ParticleSystem): boolean {
    if (!this.active) return false;

    this.health -= damage;
    this.hitFlash = 0.15;
    particles.emitSparks(
      this.x + (Math.random() - 0.5) * 50,
      this.y + (Math.random() - 0.5) * 50,
      '#ef4444',
      5
    );

    if (this.health <= 0) {
      this.active = false;
      // Massive multi-stage explosion
      particles.emitExplosion(this.x, this.y, '#d946ef', 60, true);
      particles.emitExplosion(this.x - 30, this.y + 20, '#06b6d4', 40, true);
      particles.emitExplosion(this.x + 30, this.y - 20, '#f59e0b', 40, true);
      particles.addFloatingText(this.x, this.y - 60, 'CORE-X ANNIHILATED! +2500 PTS', '#facc15');
      soundManager.playExplosion(true);
      return true;
    }
    return false;
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.hitFlash > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 25;
    } else if (enableGlow) {
      ctx.shadowColor = this.attackPhase === 3 ? '#ef4444' : '#d946ef';
      ctx.shadowBlur = 20;
    }

    // Outer Orbiting Kinetic Defense Shield Nodes
    const shieldNodes = this.attackPhase === 3 ? 4 : 3;
    for (let s = 0; s < shieldNodes; s++) {
      const sAngle = this.shieldAngle + (s * Math.PI * 2) / shieldNodes;
      const sx = Math.cos(sAngle) * (this.radius + 18);
      const sy = Math.sin(sAngle) * (this.radius + 18);

      ctx.fillStyle = this.attackPhase === 3 ? '#ef4444' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Main Dreadnought Chassis
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#0a0a14';
    ctx.strokeStyle = this.attackPhase === 3 ? '#ef4444' : '#a855f7';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.moveTo(0, 48); // Front Ram
    ctx.lineTo(44, 20); // Right Wing
    ctx.lineTo(52, -26); // Right Rear
    ctx.lineTo(24, -42); // Right Engine
    ctx.lineTo(-24, -42); // Left Engine
    ctx.lineTo(-52, -26); // Left Rear
    ctx.lineTo(-44, 20); // Left Wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Heavy Weapon Turret Pods
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(-35, 10, 16, 24);
    ctx.strokeRect(-35, 10, 16, 24);
    ctx.fillRect(19, 10, 16, 24);
    ctx.strokeRect(19, 10, 16, 24);

    // Glowing Central Core-X Reactor Eye
    const corePulse = Math.sin(Date.now() * 0.008) * 3 + 14;
    ctx.fillStyle = this.attackPhase === 3 ? '#ef4444' : '#d946ef';
    ctx.beginPath();
    ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
