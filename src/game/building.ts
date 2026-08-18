// Smart City Infrastructure Buildings
import { BuildingData } from './types';
import { ParticleSystem } from './particle';

export class BuildingManager {
  private buildings: BuildingData[] = [];
  private sparkTimer = 0;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.initBuildings(canvasWidth, canvasHeight);
  }

  public resize(width: number, height: number) {
    this.initBuildings(width, height);
  }

  private initBuildings(width: number, height: number) {
    // 3 Strategic locations across the cyber metropolis
    this.buildings = [
      {
        id: 'energy_core',
        name: 'ENERGY CORE',
        type: 'ENERGY_CORE',
        x: width * 0.22,
        y: height * 0.68,
        width: 100,
        height: 90,
        health: 1200,
        maxHealth: 1200,
        shield: 300,
        maxShield: 300,
        destroyed: false,
        hackedProgress: 0,
        color: '#06b6d4',
        description: 'Powers city grid & accelerates drone energy recharge',
        bonusText: 'Energy Regen +50%',
      },
      {
        id: 'comm_tower',
        name: 'COMMUNICATION TOWER',
        type: 'COMM_TOWER',
        x: width * 0.5,
        y: height * 0.28,
        width: 80,
        height: 110,
        health: 1000,
        maxHealth: 1000,
        shield: 250,
        maxShield: 250,
        destroyed: false,
        hackedProgress: 0,
        color: '#d946ef',
        description: 'Relays radar intelligence & threat warning telemetry',
        bonusText: 'Threat Scanner Online',
      },
      {
        id: 'control_center',
        name: 'CITY CONTROL CENTER',
        type: 'CONTROL_CENTER',
        x: width * 0.78,
        y: height * 0.68,
        width: 110,
        height: 95,
        health: 1400,
        maxHealth: 1400,
        shield: 400,
        maxShield: 400,
        destroyed: false,
        hackedProgress: 0,
        color: '#3b82f6',
        description: 'Central AI matrix coordinating city defensive perimeter',
        bonusText: 'Defense Matrix Active',
      },
    ];
  }

  public getBuildings(): BuildingData[] {
    return this.buildings;
  }

  public getActiveBuildingsCount(): number {
    return this.buildings.filter((b) => !b.destroyed).length;
  }

  public damageBuilding(buildingId: string, damage: number, particles: ParticleSystem): boolean {
    const building = this.buildings.find((b) => b.id === buildingId);
    if (!building || building.destroyed) return false;

    // Absorb into shield first
    if (building.shield > 0) {
      if (building.shield >= damage) {
        building.shield -= damage;
        particles.emitSparks(
          building.x + (Math.random() - 0.5) * building.width,
          building.y + (Math.random() - 0.5) * building.height,
          '#38bdf8',
          4
        );
        return false;
      } else {
        damage -= building.shield;
        building.shield = 0;
      }
    }

    building.health = Math.max(0, building.health - damage);
    particles.emitSparks(
      building.x + (Math.random() - 0.5) * building.width,
      building.y + (Math.random() - 0.5) * building.height,
      '#ef4444',
      6
    );

    if (building.health <= 0) {
      building.destroyed = true;
      particles.emitExplosion(building.x, building.y, building.color, 45, true);
      particles.addFloatingText(building.x, building.y - 40, `${building.name} DESTROYED!`, '#ef4444');
      return true;
    }
    return false;
  }

  public repairBuilding(buildingId: string, amount: number) {
    const building = this.buildings.find((b) => b.id === buildingId);
    if (!building || building.destroyed) return;
    building.health = Math.min(building.maxHealth, building.health + amount);
    if (building.shield < building.maxShield) {
      building.shield = Math.min(building.maxShield, building.shield + amount * 0.5);
    }
  }

  public update(dt: number, particles: ParticleSystem) {
    this.sparkTimer += dt;
    for (const b of this.buildings) {
      if (b.destroyed) continue;

      // Slow shield regeneration if not hacked
      if (b.hackedProgress === 0 && b.shield < b.maxShield) {
        b.shield = Math.min(b.maxShield, b.shield + dt * 4);
      }

      // Spark if health is critical (< 35%)
      if (b.health < b.maxHealth * 0.35 && this.sparkTimer > 0.4) {
        particles.emitSparks(
          b.x + (Math.random() - 0.5) * b.width * 0.7,
          b.y + (Math.random() - 0.5) * b.height * 0.7,
          '#f59e0b',
          2
        );
      }

      // Decay hack progress if hacker is destroyed
      if (b.hackedProgress > 0) {
        b.hackedProgress = Math.max(0, b.hackedProgress - dt * 5);
      }
    }
    if (this.sparkTimer > 0.4) this.sparkTimer = 0;
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    for (const b of this.buildings) {
      const halfW = b.width / 2;
      const halfH = b.height / 2;
      const left = b.x - halfW;
      const top = b.y - halfH;

      ctx.save();

      if (b.destroyed) {
        // Destroyed ruin layout
        ctx.fillStyle = '#1e1b2e';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(left, top, b.width, b.height);
        ctx.fillRect(left, top, b.width, b.height);

        // Broken cyber rubble
        ctx.fillStyle = '#475569';
        ctx.fillRect(left + 10, top + 10, b.width * 0.3, b.height * 0.4);
        ctx.fillRect(left + b.width * 0.5, top + b.height * 0.2, b.width * 0.4, b.height * 0.5);

        // Destroyed X badge
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left + b.width, top + b.height);
        ctx.moveTo(left + b.width, top);
        ctx.lineTo(left, top + b.height);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OFFLINE', b.x, b.y + 4);
        ctx.restore();
        continue;
      }

      // Base Structure Shadow
      ctx.fillStyle = '#050b18';
      ctx.fillRect(left + 6, top + 6, b.width, b.height);

      // Main Building Core Structure
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;

      if (enableGlow) {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
      }

      ctx.fillRect(left, top, b.width, b.height);
      ctx.strokeRect(left, top, b.width, b.height);

      // Interior Blueprint Lines & Patterns based on type
      ctx.strokeStyle = `${b.color}44`;
      ctx.lineWidth = 1;

      if (b.type === 'ENERGY_CORE') {
        // Reactor Core rings
        ctx.beginPath();
        ctx.arc(b.x, b.y, 22, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing power core
        const pulse = Math.sin(Date.now() * 0.005) * 4 + 14;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Power conduits
        ctx.strokeRect(left + 6, top + 6, b.width - 12, 8);
        ctx.strokeRect(left + 6, top + b.height - 14, b.width - 12, 8);
      } else if (b.type === 'COMM_TOWER') {
        // Radar dishes and antenna mast
        ctx.beginPath();
        ctx.moveTo(b.x, top - 18);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Pulsing radio wave rings
        const waveR = ((Date.now() * 0.02) % 30) + 6;
        ctx.beginPath();
        ctx.arc(b.x, top - 18, waveR, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();

        // Beacon light
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(b.x, top - 18, 4, 0, Math.PI * 2);
        ctx.fill();

        // Tower grid
        ctx.strokeRect(left + 12, top + 10, b.width - 24, b.height - 20);
      } else {
        // Control Center Server Rack Grid
        const cols = 3;
        const rows = 2;
        const cellW = (b.width - 24) / cols;
        const cellH = (b.height - 24) / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = (r + c + Math.floor(Date.now() * 0.002)) % 3 === 0 ? `${b.color}aa` : '#1e293b';
            ctx.fillRect(left + 12 + c * cellW, top + 12 + r * cellH, cellW - 4, cellH - 4);
          }
        }
      }

      // Active Hologram Shield Dome
      if (b.shield > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4 + (b.shield / b.maxShield) * 0.4;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, halfW + 12, halfH + 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Hacking Alert Indicator
      if (b.hackedProgress > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(left, top - 18, (b.width * b.hackedProgress) / 100, 5);
        ctx.font = 'bold 10px "Orbitron", sans-serif';
        ctx.fillText(`HACKING ${Math.round(b.hackedProgress)}%`, b.x, top - 24);
      }

      // Mini Health & Shield Bars above structure
      const barW = b.width;
      const barH = 5;
      const barY = top - 8;

      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(left, barY, barW, barH);

      // Health bar
      const healthPct = b.health / b.maxHealth;
      ctx.fillStyle = healthPct > 0.5 ? '#10b981' : healthPct > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(left, barY, barW * healthPct, barH);

      // Building Name Tag
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 10px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, b.x, top + b.height + 14);

      ctx.restore();
    }
  }
}
