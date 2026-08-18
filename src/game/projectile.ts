// Projectile System
import { Vector2D } from './types';

export type ProjectileSource = 'PLAYER' | 'ENEMY' | 'BOSS';

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  source: ProjectileSource;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  isBeam?: boolean;
  pierce?: boolean;
}

export class ProjectileSystem {
  private projectiles: Projectile[] = [];

  public spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    source: ProjectileSource,
    options?: {
      radius?: number;
      color?: string;
      glowColor?: string;
      maxLife?: number;
      isBeam?: boolean;
      pierce?: boolean;
    }
  ) {
    this.projectiles.push({
      x,
      y,
      vx,
      vy,
      damage,
      source,
      radius: options?.radius ?? 4,
      color: options?.color ?? (source === 'PLAYER' ? '#38bdf8' : '#ef4444'),
      glowColor: options?.glowColor ?? (source === 'PLAYER' ? '#06b6d4' : '#f87171'),
      life: 0,
      maxLife: options?.maxLife ?? 3.0,
      isBeam: options?.isBeam ?? false,
      pierce: options?.pierce ?? false,
    });
  }

  public update(dt: number, boundsWidth: number, boundsHeight: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.life += dt;

      // Check bounds or lifetime
      if (
        p.life >= p.maxLife ||
        p.x < -40 ||
        p.x > boundsWidth + 40 ||
        p.y < -40 ||
        p.y > boundsHeight + 40
      ) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    for (const p of this.projectiles) {
      ctx.save();

      if (enableGlow) {
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 10;
      }

      const angle = Math.atan2(p.vy, p.vx);

      if (p.source === 'PLAYER') {
        // Player High-Tech Plasma Bolt / Laser
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);

        // Core laser
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-8, -2, 16, 4, 2);
        ctx.fill();

        // Outer glow capsule
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-10, -3.5, 20, 7, 3.5);
        ctx.stroke();
      } else if (p.source === 'BOSS') {
        // Boss Energy Plasma Sphere
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else {
        // Standard Enemy Bullet
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.6, p.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  public removeAt(index: number) {
    this.projectiles.splice(index, 1);
  }

  public clear() {
    this.projectiles = [];
  }
}
