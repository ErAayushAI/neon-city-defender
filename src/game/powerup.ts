// Power-ups Management
import { PowerUpType } from './types';

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  symbol: string;
  label: string;
  life: number;
  maxLife: number;
  floatOffset: number;
}

export class PowerUpManager {
  private powerUps: PowerUpItem[] = [];
  private nextId = 1;

  public spawn(x: number, y: number, specificType?: PowerUpType) {
    const types: PowerUpType[] = [
      'HEALTH',
      'ENERGY',
      'RAPID_FIRE',
      'SHIELD',
      'EMP_RECHARGE',
      'SCORE_MULTIPLIER',
    ];

    const type = specificType ?? types[Math.floor(Math.random() * types.length)];
    let color = '#06b6d4';
    let glowColor = '#22d3ee';
    let symbol = '⚡';
    let label = 'POWER';

    switch (type) {
      case 'HEALTH':
        color = '#10b981';
        glowColor = '#34d399';
        symbol = '+';
        label = 'HP REPAIR';
        break;
      case 'ENERGY':
        color = '#06b6d4';
        glowColor = '#38bdf8';
        symbol = '⚡';
        label = 'ENERGY CELL';
        break;
      case 'RAPID_FIRE':
        color = '#f59e0b';
        glowColor = '#fbbf24';
        symbol = '🔥';
        label = 'RAPID FIRE';
        break;
      case 'SHIELD':
        color = '#3b82f6';
        glowColor = '#60a5fa';
        symbol = '🛡️';
        label = 'CYBER SHIELD';
        break;
      case 'EMP_RECHARGE':
        color = '#d946ef';
        glowColor = '#f472b6';
        symbol = '💥';
        label = 'EMP OVERDRIVE';
        break;
      case 'SCORE_MULTIPLIER':
        color = '#eab308';
        glowColor = '#facc15';
        symbol = '2X';
        label = 'DOUBLE SCORE';
        break;
    }

    this.powerUps.push({
      id: this.nextId++,
      type,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 16,
      color,
      glowColor,
      symbol,
      label,
      life: 0,
      maxLife: 15.0, // Despawn after 15 seconds
      floatOffset: Math.random() * Math.PI * 2,
    });
  }

  public update(dt: number, playerX: number, playerY: number) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.life += dt;

      // Gentle movement & drift
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Magnetism: Attract toward player when drone is nearby (within 130px)
      const dx = playerX - p.x;
      const dy = playerY - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 140 && dist > 1) {
        const pullSpeed = (140 - dist) * 2.2 * dt;
        p.x += (dx / dist) * pullSpeed;
        p.y += (dy / dist) * pullSpeed;
      }

      if (p.life >= p.maxLife) {
        this.powerUps.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    const time = Date.now() * 0.005;

    for (const p of this.powerUps) {
      ctx.save();

      // Flashing warning when about to expire (last 3 seconds)
      if (p.maxLife - p.life < 3) {
        if (Math.floor(Date.now() / 150) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }
      }

      const bobY = p.y + Math.sin(time + p.floatOffset) * 4;

      if (enableGlow) {
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 14;
      }

      // Outer rotating hexagon/circle
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(10, 20, 40, 0.85)';
      ctx.beginPath();
      ctx.arc(p.x, bobY, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner pulse ring
      const innerPulse = Math.sin(time * 2 + p.floatOffset) * 3 + p.radius * 0.65;
      ctx.strokeStyle = `${p.color}88`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, bobY, Math.max(2, innerPulse), 0, Math.PI * 2);
      ctx.stroke();

      // Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, p.x, bobY);

      // Label below
      ctx.fillStyle = p.color;
      ctx.font = '700 8px "Orbitron", sans-serif';
      ctx.fillText(p.label, p.x, bobY + p.radius + 10);

      ctx.restore();
    }
  }

  public getPowerUps(): PowerUpItem[] {
    return this.powerUps;
  }

  public remove(id: number) {
    const idx = this.powerUps.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.powerUps.splice(idx, 1);
    }
  }

  public clear() {
    this.powerUps = [];
  }
}
