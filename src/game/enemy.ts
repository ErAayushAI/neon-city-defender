// Enemy Drones AI and State System
import { EnemyType, Vector2D } from './types';
import { ParticleSystem } from './particle';
import { ProjectileSystem } from './projectile';
import { BuildingManager } from './building';
import { soundManager } from './audio';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  speed: number;
  health: number;
  maxHealth: number;
  scoreValue: number;
  color: string;
  glowColor: string;
  fireCooldown: number;
  fireRate: number;
  targetBuildingId: string | null;
  hackingTimer: number;
  hitFlash: number;
  zigzagTimer: number;
}

export class EnemyManager {
  private enemies: Enemy[] = [];
  private nextId = 1;

  public spawn(
    type: EnemyType,
    spawnX: number,
    spawnY: number,
    level: number = 1
  ) {
    let speed = 120;
    let health = 30;
    let scoreValue = 100;
    let radius = 16;
    let color = '#ef4444';
    let glowColor = '#f87171';
    let fireRate = 2.0;

    // Scale stats with wave level
    const levelScale = 1 + (level - 1) * 0.12;

    switch (type) {
      case 'SCOUT':
        speed = (180 + Math.random() * 40) * (1 + (level - 1) * 0.05);
        health = Math.round(25 * levelScale);
        scoreValue = 100;
        radius = 14;
        color = '#ef4444';
        glowColor = '#f87171';
        fireRate = 1.8;
        break;

      case 'HUNTER':
        speed = (140 + Math.random() * 20) * (1 + (level - 1) * 0.04);
        health = Math.round(50 * levelScale);
        scoreValue = 200;
        radius = 18;
        color = '#f97316';
        glowColor = '#fb923c';
        fireRate = 2.2;
        break;

      case 'TANK':
        speed = 70 * (1 + (level - 1) * 0.02);
        health = Math.round(140 * levelScale);
        scoreValue = 400;
        radius = 26;
        color = '#dc2626';
        glowColor = '#ef4444';
        fireRate = 3.0;
        break;

      case 'HACKER':
        speed = 110;
        health = Math.round(45 * levelScale);
        scoreValue = 500;
        radius = 16;
        color = '#a855f7';
        glowColor = '#c084fc';
        fireRate = 999; // Doesn't fire normal bullets
        break;
    }

    this.enemies.push({
      id: this.nextId++,
      type,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      angle: 0,
      radius,
      speed,
      health,
      maxHealth: health,
      scoreValue,
      color,
      glowColor,
      fireCooldown: Math.random() * fireRate,
      fireRate,
      targetBuildingId: null,
      hackingTimer: 0,
      hitFlash: 0,
      zigzagTimer: Math.random() * Math.PI * 2,
    });
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    buildings: BuildingManager,
    projectiles: ProjectileSystem,
    particles: ParticleSystem
  ) {
    const activeBuildings = buildings.getBuildings().filter((b) => !b.destroyed);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Update timers
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
      if (e.fireCooldown > 0) e.fireCooldown = Math.max(0, e.fireCooldown - dt);
      e.zigzagTimer += dt * 4;

      let targetX = playerX;
      let targetY = playerY;

      if (e.type === 'HACKER') {
        // Cyber Hacker prioritizes the closest surviving building
        if (!e.targetBuildingId || !activeBuildings.some((b) => b.id === e.targetBuildingId)) {
          if (activeBuildings.length > 0) {
            let closestDist = Infinity;
            let closestBuilding = activeBuildings[0];
            for (const b of activeBuildings) {
              const d = Math.hypot(b.x - e.x, b.y - e.y);
              if (d < closestDist) {
                closestDist = d;
                closestBuilding = b;
              }
            }
            e.targetBuildingId = closestBuilding.id;
          } else {
            e.targetBuildingId = null;
          }
        }

        const targetBuilding = activeBuildings.find((b) => b.id === e.targetBuildingId);

        if (targetBuilding) {
          targetX = targetBuilding.x;
          targetY = targetBuilding.y;

          const distToBuilding = Math.hypot(targetX - e.x, targetY - e.y);

          // If within hacking proximity (< 90px)
          if (distToBuilding < 90) {
            e.hackingTimer += dt;
            targetBuilding.hackedProgress = Math.min(100, targetBuilding.hackedProgress + dt * 15);

            // Hack beam particles & sound
            if (Math.random() < 0.3) {
              particles.emitSparks(targetBuilding.x, targetBuilding.y, '#c084fc', 2);
            }

            // Deal hack damage to building
            buildings.damageBuilding(targetBuilding.id, dt * 25, particles);

            // Slow down while hacking
            e.vx *= 0.8;
            e.vy *= 0.8;
            continue;
          }
        }
      } else if (e.type === 'SCOUT') {
        // Scouts attack player or nearby building
        if (activeBuildings.length > 0 && Math.random() < 0.4) {
          const b = activeBuildings[Math.floor(Math.random() * activeBuildings.length)];
          targetX = b.x;
          targetY = b.y;
        }
      }

      // Steering towards target with obstacle separation
      const dx = targetX - e.x;
      const dy = targetY - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 1) {
        let dirX = dx / dist;
        let dirY = dy / dist;

        // Scouts execute a lateral zig-zag evasive sweep
        if (e.type === 'SCOUT') {
          const perpX = -dirY;
          const perpY = dirX;
          const weave = Math.sin(e.zigzagTimer) * 0.4;
          dirX += perpX * weave;
          dirY += perpY * weave;
        }

        e.vx = dirX * e.speed;
        e.vy = dirY * e.speed;
        e.angle = Math.atan2(e.vy, e.vx);
      }

      // Position update
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // Thrusters
      if (Math.random() < 0.25) {
        particles.emitThrusterTrail(e.x, e.y, e.angle, e.color);
      }

      // Attack / Firing Weapon Logic
      if (e.type !== 'HACKER' && e.fireCooldown <= 0 && dist < 500) {
        e.fireCooldown = e.fireRate + Math.random() * 0.5;

        const bulletSpeed = e.type === 'TANK' ? 8 : 10;
        const bvx = Math.cos(e.angle) * bulletSpeed;
        const bvy = Math.sin(e.angle) * bulletSpeed;

        if (e.type === 'TANK') {
          // Heavy Cannon Blast
          projectiles.spawn(e.x, e.y, bvx, bvy, 35, 'ENEMY', {
            radius: 8,
            color: '#ef4444',
            glowColor: '#dc2626',
          });
          soundManager.playEnemyLaser();
        } else if (e.type === 'HUNTER') {
          // Hunter 2-shot burst
          projectiles.spawn(e.x - 6, e.y, bvx, bvy, 14, 'ENEMY', {
            radius: 4.5,
            color: '#f97316',
            glowColor: '#ea580c',
          });
          projectiles.spawn(e.x + 6, e.y, bvx, bvy, 14, 'ENEMY', {
            radius: 4.5,
            color: '#f97316',
            glowColor: '#ea580c',
          });
          soundManager.playEnemyLaser();
        } else {
          // Scout rapid light laser
          projectiles.spawn(e.x, e.y, bvx, bvy, 10, 'ENEMY', {
            radius: 3.5,
            color: '#f43f5e',
            glowColor: '#e11d48',
          });
          soundManager.playEnemyLaser();
        }
      }
    }
  }

  public damageEnemy(
    index: number,
    damage: number,
    particles: ParticleSystem
  ): { destroyed: boolean; enemy: Enemy } {
    const e = this.enemies[index];
    e.health -= damage;
    e.hitFlash = 0.15;
    particles.emitSparks(e.x, e.y, e.glowColor, 4);

    if (e.health <= 0) {
      this.enemies.splice(index, 1);
      particles.emitExplosion(e.x, e.y, e.color, e.type === 'TANK' ? 32 : 18, e.type === 'TANK');
      soundManager.playExplosion(e.type === 'TANK');
      return { destroyed: true, enemy: e };
    }

    return { destroyed: false, enemy: e };
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    for (const e of this.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);

      if (e.hitFlash > 0) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 18;
      } else if (enableGlow) {
        ctx.shadowColor = e.glowColor;
        ctx.shadowBlur = 10;
      }

      ctx.rotate(e.angle);

      // Unique Cyber Design per Drone Archetype
      if (e.type === 'SCOUT') {
        // Triangular stealth interceptor
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#1e1b4b';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eye sensor
        ctx.fillStyle = e.glowColor;
        ctx.beginPath();
        ctx.arc(4, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'HUNTER') {
        // Twin-pronged hunter seeker drone
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#291804';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(16, -6);
        ctx.lineTo(8, -14);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-12, 10);
        ctx.lineTo(8, 14);
        ctx.lineTo(16, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Twin cannons
        ctx.fillStyle = e.color;
        ctx.fillRect(10, -8, 6, 2.5);
        ctx.fillRect(10, 5.5, 6, 2.5);
      } else if (e.type === 'TANK') {
        // Heavy Armored Quad-Plated Juggernaut
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#1c0a0a';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(14, -18);
        ctx.lineTo(-16, -18);
        ctx.lineTo(-22, 0);
        ctx.lineTo(-16, 18);
        ctx.lineTo(14, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Heavy central Cannon
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.fillRect(6, -5, 18, 10);
        ctx.strokeRect(6, -5, 18, 10);

        // Core reactor
        ctx.fillStyle = e.glowColor;
        ctx.beginPath();
        ctx.arc(-2, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'HACKER') {
        // Spidery Cyber Infiltrator with glowing data tentacles
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#1d0b2e';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Data nodes / antennas
        for (let a = 0; a < 4; a++) {
          const rot = (a * Math.PI) / 2 + Math.sin(e.zigzagTimer) * 0.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(rot) * 16, Math.sin(rot) * 16);
          ctx.strokeStyle = e.glowColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      ctx.restore();

      // Mini Health Bar above drone
      if (e.health < e.maxHealth) {
        ctx.save();
        const barW = e.radius * 1.8;
        const barH = 3;
        const barX = e.x - barW / 2;
        const barY = e.y - e.radius - 8;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX, barY, barW, barH);

        const hpPct = e.health / e.maxHealth;
        ctx.fillStyle = e.color;
        ctx.fillRect(barX, barY, barW * hpPct, barH);
        ctx.restore();
      }

      // Render Hacker Data Siphon Beam if hacking
      if (e.type === 'HACKER' && e.targetBuildingId && e.hackingTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2 + Math.sin(Date.now() * 0.02) * 1;
        ctx.shadowColor = '#d946ef';
        ctx.shadowBlur = 12;

        // Pulsing data beam
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + Math.cos(e.angle) * 70, e.y + Math.sin(e.angle) * 70);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  public clear() {
    this.enemies = [];
  }
}
