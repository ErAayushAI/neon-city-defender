// High performance particle & visual effects system

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  decay: number;
  glow: boolean;
  shape?: 'circle' | 'spark' | 'ring' | 'square';
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  width: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private shockwaves: Shockwave[] = [];
  private maxParticles = 600;

  public update(dt: number) {
    // Update regular particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vx *= 0.96; // drag
      p.vy *= 0.96;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * dt; // float upwards
      ft.life += dt;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      ft.scale = Math.min(1.2, 0.8 + (ft.life / ft.maxLife) * 0.4);

      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      const progress = sw.life / sw.maxLife;
      sw.radius = sw.maxRadius * Math.sin((progress * Math.PI) / 2);
      sw.alpha = Math.max(0, 1 - progress);

      if (sw.life >= sw.maxLife) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    // Draw shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, Math.max(1, sw.radius), 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = sw.alpha;
      ctx.lineWidth = sw.width * (1 - sw.life / sw.maxLife);
      if (enableGlow) {
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15;
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.glow && enableGlow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }

      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'spark') {
        ctx.beginPath();
        const angle = Math.atan2(p.vy, p.vx);
        const len = p.size * 2.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len);
        ctx.lineWidth = p.size * 0.8;
        ctx.stroke();
      } else if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'ring') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Draw floating texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${Math.round(14 * ft.scale)}px 'Orbitron', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      if (enableGlow) {
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 6;
      }
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // Emitters
  public emitExplosion(x: number, y: number, color: string = '#06b6d4', count: number = 20, isLarge: boolean = false) {
    const total = isLarge ? count * 2 : count;
    for (let i = 0; i < total; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * (isLarge ? 2.2 : 1.2);
      const isSpark = Math.random() > 0.4;
      const particleColors = [color, '#ffffff', '#ec4899', '#38bdf8'];
      const pColor = particleColors[Math.floor(Math.random() * particleColors.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isSpark ? Math.random() * 3 + 1 : Math.random() * 4 + 2,
        color: pColor,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 0.4 + (isLarge ? 0.6 : 0.3),
        decay: 1,
        glow: true,
        shape: isSpark ? 'spark' : 'circle',
      });
    }

    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: isLarge ? 120 : 60,
      color: color,
      width: isLarge ? 6 : 3,
      alpha: 1,
      life: 0,
      maxLife: isLarge ? 0.6 : 0.35,
    });
  }

  public emitSparks(x: number, y: number, color: string = '#f59e0b', count: number = 6) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 0.2 + 0.15,
        decay: 1,
        glow: true,
        shape: 'spark',
      });
    }
  }

  public emitThrusterTrail(x: number, y: number, angle: number, color: string = '#06b6d4') {
    if (this.particles.length >= this.maxParticles) return;
    const spread = (Math.random() - 0.5) * 0.5;
    const trailAngle = angle + Math.PI + spread;
    const speed = Math.random() * 2 + 1;

    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(trailAngle) * speed,
      vy: Math.sin(trailAngle) * speed,
      size: Math.random() * 2.5 + 1.5,
      color,
      alpha: 0.8,
      life: 0,
      maxLife: 0.25,
      decay: 1,
      glow: true,
      shape: 'circle',
    });
  }

  public emitEMPShockwave(x: number, y: number, radius: number = 240) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: radius,
      color: '#06b6d4',
      width: 8,
      alpha: 1,
      life: 0,
      maxLife: 0.7,
    });
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius: radius * 0.85,
      color: '#3b82f6',
      width: 4,
      alpha: 0.8,
      life: 0.05,
      maxLife: 0.65,
    });

    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const speed = Math.random() * 3 + 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: i % 2 === 0 ? '#38bdf8' : '#a855f7',
        alpha: 1,
        life: 0,
        maxLife: 0.6,
        decay: 1,
        glow: true,
        shape: 'spark',
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#06b6d4') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.9,
      scale: 1,
    });
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }
}
