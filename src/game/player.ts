// Player Drone Controller
import { PlayerStats, Vector2D } from './types';
import { ParticleSystem } from './particle';
import { ProjectileSystem } from './projectile';
import { soundManager } from './audio';

export class PlayerDrone {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public angle: number = 0;
  public radius: number = 22;
  public speed: number = 320;

  public stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    score: 0,
    combo: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    maxComboTimer: 4.5,
    level: 1,
    empCooldown: 0,
    empMaxCooldown: 10.0,
    shieldActive: false,
    shieldTimeRemaining: 0,
    shieldMaxDuration: 6.0,
    rapidFireActive: false,
    rapidFireTimeRemaining: 0,
    scoreMultiplierActive: false,
    scoreMultiplierTimeRemaining: 0,
    enemiesDestroyed: 0,
    bossesDefeated: 0,
  };

  private fireCooldown: number = 0;
  private hitFlashTimer: number = 0;
  private propellerAngle: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.stats = {
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      score: 0,
      combo: 0,
      comboMultiplier: 1,
      comboTimer: 0,
      maxComboTimer: 4.5,
      level: 1,
      empCooldown: 0,
      empMaxCooldown: 10.0,
      shieldActive: false,
      shieldTimeRemaining: 0,
      shieldMaxDuration: 6.0,
      rapidFireActive: false,
      rapidFireTimeRemaining: 0,
      scoreMultiplierActive: false,
      scoreMultiplierTimeRemaining: 0,
      enemiesDestroyed: 0,
      bossesDefeated: 0,
    };
  }

  public handleInput(
    moveDir: Vector2D,
    aimPos: Vector2D,
    isShooting: boolean,
    dt: number,
    projectiles: ProjectileSystem,
    particles: ParticleSystem,
    nearEnergyCore: boolean = false
  ) {
    // Movement Physics (Smooth acceleration with damping)
    const targetVx = moveDir.x * this.speed;
    const targetVy = moveDir.y * this.speed;
    this.vx += (targetVx - this.vx) * Math.min(1, dt * 10);
    this.vy += (targetVy - this.vy) * Math.min(1, dt * 10);

    // Aiming towards mouse / touch position
    const dx = aimPos.x - this.x;
    const dy = aimPos.y - this.y;
    if (Math.hypot(dx, dy) > 10) {
      this.angle = Math.atan2(dy, dx);
    }

    // Passive Energy Recharge (Boosted if near operational Energy Core)
    const rechargeRate = (nearEnergyCore ? 20 : 12) * dt;
    this.stats.energy = Math.min(this.stats.maxEnergy, this.stats.energy + rechargeRate);

    // Update Timers & Cooldowns
    if (this.stats.empCooldown > 0) {
      this.stats.empCooldown = Math.max(0, this.stats.empCooldown - dt);
    }
    if (this.fireCooldown > 0) {
      this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    }
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    }

    // Shield Timer
    if (this.stats.shieldActive) {
      this.stats.shieldTimeRemaining -= dt;
      if (this.stats.shieldTimeRemaining <= 0) {
        this.stats.shieldActive = false;
        particles.addFloatingText(this.x, this.y - 30, 'SHIELD EXPIRED', '#60a5fa');
      }
    }

    // Rapid Fire Timer
    if (this.stats.rapidFireActive) {
      this.stats.rapidFireTimeRemaining -= dt;
      if (this.stats.rapidFireTimeRemaining <= 0) {
        this.stats.rapidFireActive = false;
      }
    }

    // Score Multiplier Timer
    if (this.stats.scoreMultiplierActive) {
      this.stats.scoreMultiplierTimeRemaining -= dt;
      if (this.stats.scoreMultiplierTimeRemaining <= 0) {
        this.stats.scoreMultiplierActive = false;
      }
    }

    // Combo Decay
    if (this.stats.combo > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 0;
        this.stats.comboMultiplier = 1;
      }
    }

    // Shooting Weapon Logic
    if (isShooting && this.fireCooldown <= 0) {
      this.shoot(projectiles, particles);
    }

    // Thruster Trail when moving
    if (Math.hypot(this.vx, this.vy) > 20) {
      const moveAngle = Math.atan2(this.vy, this.vx);
      particles.emitThrusterTrail(
        this.x - Math.cos(moveAngle) * 16,
        this.y - Math.sin(moveAngle) * 16,
        moveAngle,
        this.stats.rapidFireActive ? '#f59e0b' : '#06b6d4'
      );
    }
  }

  private shoot(projectiles: ProjectileSystem, particles: ParticleSystem) {
    const isRapid = this.stats.rapidFireActive;
    const cooldown = isRapid ? 0.08 : 0.16;
    this.fireCooldown = cooldown;

    const baseSpeed = 16;
    const damage = isRapid ? 18 : 25;

    // Dual offset cannon barrels
    const offsetDist = 12;
    const perpAngle = this.angle + Math.PI / 2;
    const forwardDist = 18;

    const leftX = this.x + Math.cos(this.angle) * forwardDist + Math.cos(perpAngle) * offsetDist;
    const leftY = this.y + Math.sin(this.angle) * forwardDist + Math.sin(perpAngle) * offsetDist;

    const rightX = this.x + Math.cos(this.angle) * forwardDist - Math.cos(perpAngle) * offsetDist;
    const rightY = this.y + Math.sin(this.angle) * forwardDist - Math.sin(perpAngle) * offsetDist;

    const vx = Math.cos(this.angle) * baseSpeed;
    const vy = Math.sin(this.angle) * baseSpeed;

    const color = isRapid ? '#fbbf24' : '#38bdf8';
    const glowColor = isRapid ? '#f59e0b' : '#06b6d4';

    projectiles.spawn(leftX, leftY, vx, vy, damage, 'PLAYER', { color, glowColor });
    projectiles.spawn(rightX, rightY, vx, vy, damage, 'PLAYER', { color, glowColor });

    // Muzzle sparks
    particles.emitSparks(leftX, leftY, color, 2);
    particles.emitSparks(rightX, rightY, color, 2);

    if (isRapid) {
      soundManager.playRapidLaser();
    } else {
      soundManager.playLaser();
    }
  }

  public activateEMP(particles: ParticleSystem): boolean {
    if (this.stats.empCooldown > 0) return false;

    this.stats.empCooldown = this.stats.empMaxCooldown;
    particles.emitEMPShockwave(this.x, this.y, 320);
    soundManager.playEMP();
    particles.addFloatingText(this.x, this.y - 40, 'EMP DISCHARGED!', '#38bdf8');
    return true;
  }

  public activateShield(particles: ParticleSystem): boolean {
    if (this.stats.shieldActive || this.stats.energy < 30) return false;

    this.stats.energy -= 30;
    this.stats.shieldActive = true;
    this.stats.shieldTimeRemaining = this.stats.shieldMaxDuration;
    soundManager.playShieldActivate();
    particles.addFloatingText(this.x, this.y - 30, 'CYBER SHIELD ACTIVE', '#38bdf8');
    return true;
  }

  public takeDamage(amount: number, particles: ParticleSystem): boolean {
    if (this.stats.shieldActive) {
      particles.emitSparks(this.x, this.y, '#60a5fa', 5);
      return false;
    }

    this.stats.health = Math.max(0, this.stats.health - amount);
    this.hitFlashTimer = 0.2;
    soundManager.playPlayerHit();
    particles.emitSparks(this.x, this.y, '#ef4444', 8);

    // Reset combo on hit
    this.stats.combo = 0;
    this.stats.comboMultiplier = 1;

    return this.stats.health <= 0;
  }

  public addScore(points: number, particles: ParticleSystem) {
    // Multiplier calculation
    const mult = this.stats.comboMultiplier * (this.stats.scoreMultiplierActive ? 2 : 1);
    const finalPoints = Math.round(points * mult);
    this.stats.score += finalPoints;

    // Combo streak update
    this.stats.combo++;
    this.stats.comboTimer = this.stats.maxComboTimer;

    // Milestone multiplier tiers: 5x, 10x, 20x, 35x
    let newMult = 1;
    if (this.stats.combo >= 35) newMult = 5;
    else if (this.stats.combo >= 20) newMult = 4;
    else if (this.stats.combo >= 10) newMult = 3;
    else if (this.stats.combo >= 5) newMult = 2;

    if (newMult > this.stats.comboMultiplier) {
      soundManager.playComboUp(newMult);
      particles.addFloatingText(this.x, this.y - 50, `COMBO x${newMult}!`, '#facc15');
    }
    this.stats.comboMultiplier = newMult;
  }

  public update(dt: number, boundsWidth: number, boundsHeight: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Screen Boundary clamping
    this.x = Math.max(this.radius, Math.min(boundsWidth - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(boundsHeight - this.radius, this.y));

    // Propeller spinning animation
    this.propellerAngle += dt * 30;
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Damage flash overlay
    if (this.hitFlashTimer > 0) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
    } else if (enableGlow) {
      ctx.shadowColor = this.stats.rapidFireActive ? '#f59e0b' : '#06b6d4';
      ctx.shadowBlur = 15;
    }

    // Invulnerability Shield Dome
    if (this.stats.shieldActive) {
      ctx.save();
      const shieldPulse = Math.sin(Date.now() * 0.008) * 3 + this.radius + 14;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, shieldPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Shield hex grid effect
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    ctx.rotate(this.angle);

    // Drone 4-Arm Quadcopter Frame
    const armLen = 18;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    // Diagonal arms
    ctx.moveTo(-armLen, -armLen);
    ctx.lineTo(armLen, armLen);
    ctx.moveTo(-armLen, armLen);
    ctx.lineTo(armLen, -armLen);
    ctx.stroke();

    // 4 Rotors & Propeller Blades
    const rotorOffsets = [
      { x: -armLen, y: -armLen },
      { x: armLen, y: -armLen },
      { x: -armLen, y: armLen },
      { x: armLen, y: armLen },
    ];

    for (const r of rotorOffsets) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Rotor blades
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r.x - Math.cos(this.propellerAngle) * 9, r.y - Math.sin(this.propellerAngle) * 9);
      ctx.lineTo(r.x + Math.cos(this.propellerAngle) * 9, r.y + Math.sin(this.propellerAngle) * 9);
      ctx.stroke();
    }

    // Dual Plasma Cannon Barrels
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = this.stats.rapidFireActive ? '#f59e0b' : '#06b6d4';
    ctx.lineWidth = 2;
    ctx.fillRect(8, -14, 14, 4);
    ctx.strokeRect(8, -14, 14, 4);
    ctx.fillRect(8, 10, 14, 4);
    ctx.strokeRect(8, 10, 14, 4);

    // Central Cyber Chassis (Aerospace stealth fuselage)
    ctx.fillStyle = this.hitFlashTimer > 0 ? '#ef4444' : '#090d16';
    ctx.strokeStyle = this.stats.rapidFireActive ? '#fbbf24' : '#38bdf8';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(18, 0); // Front nose cone
    ctx.lineTo(6, -12); // Left wing shoulder
    ctx.lineTo(-14, -10); // Left rear
    ctx.lineTo(-8, 0); // Engine exhaust notch
    ctx.lineTo(-14, 10); // Right rear
    ctx.lineTo(6, 12); // Right wing shoulder
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Power Reactor Core in center
    ctx.fillStyle = this.stats.rapidFireActive ? '#f59e0b' : '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit / AI Scanner Visor
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
