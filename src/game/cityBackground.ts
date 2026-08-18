// Procedural Cyberpunk Smart City Background Generator and Renderer

interface CyberBuilding {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  roofFeature: 'helipad' | 'antenna' | 'solar' | 'satellite' | 'none';
  windows: { x: number; y: number; on: boolean; color: string }[];
}

interface CyberCar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  color: string;
  roadAxis: 'H' | 'V';
  lane: number;
}

interface Billboard {
  x: number;
  y: number;
  w: number;
  h: number;
  texts: string[];
  currentTextIndex: number;
  timer: number;
  color: string;
}

export class CityBackground {
  private buildings: CyberBuilding[] = [];
  private cars: CyberCar[] = [];
  private billboards: Billboard[] = [];
  private gridSpacing = 80;
  private width = 1280;
  private height = 720;

  constructor(width: number, height: number) {
    this.init(width, height);
  }

  public resize(width: number, height: number) {
    this.init(width, height);
  }

  private init(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buildings = [];
    this.cars = [];
    this.billboards = [];

    const buildingColors = ['#080e1e', '#0b1329', '#060a17', '#0e1726', '#09101f'];
    const windowColors = ['#06b6d4', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'];

    // Generate grid city skyline background blocks
    const cols = Math.ceil(width / 130);
    const rows = Math.ceil(height / 110);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Leave gaps for strategic roadways and building plots
        if (Math.random() < 0.35) continue;

        const bx = c * 130 + 15;
        const by = r * 110 + 15;
        const bw = Math.min(100, Math.random() * 35 + 75);
        const bh = Math.min(85, Math.random() * 30 + 60);

        // Windows
        const windows: CyberBuilding['windows'] = [];
        const winCols = Math.floor((bw - 16) / 14);
        const winRows = Math.floor((bh - 16) / 14);

        for (let wc = 0; wc < winCols; wc++) {
          for (let wr = 0; wr < winRows; wr++) {
            if (Math.random() < 0.6) {
              windows.push({
                x: 8 + wc * 14,
                y: 8 + wr * 14,
                on: Math.random() > 0.3,
                color: windowColors[Math.floor(Math.random() * windowColors.length)],
              });
            }
          }
        }

        const features: CyberBuilding['roofFeature'][] = ['helipad', 'antenna', 'solar', 'satellite', 'none'];
        const roofFeature = features[Math.floor(Math.random() * features.length)];

        this.buildings.push({
          x: bx,
          y: by,
          w: bw,
          h: bh,
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
          roofFeature,
          windows,
        });
      }
    }

    // Generate Cyber Cars (Autonomous Light Trail Speeders)
    const carColors = ['#06b6d4', '#f43f5e', '#fbbf24', '#a855f7', '#38bdf8'];
    for (let i = 0; i < 24; i++) {
      const isHorizontal = Math.random() > 0.5;
      const speed = (Math.random() * 2 + 2) * (Math.random() > 0.5 ? 1 : -1);

      this.cars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: isHorizontal ? speed * 60 : 0,
        vy: isHorizontal ? 0 : speed * 60,
        length: Math.random() * 22 + 16,
        color: carColors[Math.floor(Math.random() * carColors.length)],
        roadAxis: isHorizontal ? 'H' : 'V',
        lane: Math.floor(Math.random() * 4),
      });
    }

    // Generate Holographic Billboards
    this.billboards = [
      {
        x: width * 0.15,
        y: height * 0.18,
        w: 90,
        h: 30,
        texts: ['CYBER_NET', 'DEFCON 1', 'GRID: OK'],
        currentTextIndex: 0,
        timer: 0,
        color: '#06b6d4',
      },
      {
        x: width * 0.82,
        y: height * 0.22,
        w: 100,
        h: 34,
        texts: ['SMART_CITY', 'ZONE: SECURE', 'NEON_CORE'],
        currentTextIndex: 0,
        timer: 1.5,
        color: '#d946ef',
      },
      {
        x: width * 0.48,
        y: height * 0.82,
        w: 110,
        h: 32,
        texts: ['AI OVERWATCH', 'AIRSPACE: RESTRICTED', 'SHIELDS: 100%'],
        currentTextIndex: 0,
        timer: 0.8,
        color: '#3b82f6',
      },
    ];
  }

  public update(dt: number) {
    // Update Cyber Cars
    for (const car of this.cars) {
      car.x += car.vx * dt;
      car.y += car.vy * dt;

      // Wrap around screen
      if (car.x < -40) car.x = this.width + 40;
      if (car.x > this.width + 40) car.x = -40;
      if (car.y < -40) car.y = this.height + 40;
      if (car.y > this.height + 40) car.y = -40;
    }

    // Update Billboards
    for (const b of this.billboards) {
      b.timer += dt;
      if (b.timer > 3.5) {
        b.timer = 0;
        b.currentTextIndex = (b.currentTextIndex + 1) % b.texts.length;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, enableGlow: boolean = true) {
    // 1. Deep Midnight Base
    ctx.fillStyle = '#020612';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Cyber Grid Ground Matrix
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += this.gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += this.gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // 3. Roads and Neon Traffic Lanes
    const roadColor = '#060d1e';
    const laneLineColor = 'rgba(6, 182, 212, 0.12)';

    // Major horizontal highways
    const hLanes = [this.height * 0.45, this.height * 0.88];
    for (const hy of hLanes) {
      ctx.fillStyle = roadColor;
      ctx.fillRect(0, hy - 22, this.width, 44);
      // Lane dividers
      ctx.strokeStyle = laneLineColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(0, hy);
      ctx.lineTo(this.width, hy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Major vertical avenues
    const vLanes = [this.width * 0.36, this.width * 0.65];
    for (const vx of vLanes) {
      ctx.fillStyle = roadColor;
      ctx.fillRect(vx - 22, 0, 44, this.height);
      ctx.strokeStyle = laneLineColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx, this.height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Autonomous Light-trail Cars
    for (const car of this.cars) {
      ctx.save();
      ctx.strokeStyle = car.color;
      ctx.lineWidth = 2.5;
      if (enableGlow) {
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      if (car.roadAxis === 'H') {
        const dir = car.vx > 0 ? 1 : -1;
        ctx.moveTo(car.x, car.y);
        ctx.lineTo(car.x - dir * car.length, car.y);
      } else {
        const dir = car.vy > 0 ? 1 : -1;
        ctx.moveTo(car.x, car.y);
        ctx.lineTo(car.x, car.y - dir * car.length);
      }
      ctx.stroke();

      // Front headlight node
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(car.x, car.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Buildings Background
    for (const b of this.buildings) {
      ctx.save();
      // Drop Shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(b.x + 4, b.y + 4, b.w, b.h);

      // Building Wall
      ctx.fillStyle = b.color;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      // Windows
      for (const w of b.windows) {
        if (w.on) {
          ctx.fillStyle = w.color;
          ctx.globalAlpha = 0.45;
          ctx.fillRect(b.x + w.x, b.y + w.y, 7, 7);
          ctx.globalAlpha = 1.0;
        }
      }

      // Rooftop Features
      if (b.roofFeature === 'helipad') {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2, b.y + b.h / 2, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('H', b.x + b.w / 2, b.y + b.h / 2);
      } else if (b.roofFeature === 'antenna') {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(b.x + b.w / 2, b.y);
        ctx.lineTo(b.x + b.w / 2, b.y - 12);
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2, b.y - 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.roofFeature === 'solar') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
      }

      ctx.restore();
    }

    // 6. Holographic Billboards
    for (const bb of this.billboards) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 20, 35, 0.85)';
      ctx.strokeStyle = bb.color;
      ctx.lineWidth = 1.5;

      if (enableGlow) {
        ctx.shadowColor = bb.color;
        ctx.shadowBlur = 12;
      }

      ctx.fillRect(bb.x, bb.y, bb.w, bb.h);
      ctx.strokeRect(bb.x, bb.y, bb.w, bb.h);

      // Flashing border corner marks
      ctx.fillStyle = bb.color;
      ctx.fillRect(bb.x, bb.y, 4, 4);
      ctx.fillRect(bb.x + bb.w - 4, bb.y, 4, 4);
      ctx.fillRect(bb.x, bb.y + bb.h - 4, 4, 4);
      ctx.fillRect(bb.x + bb.w - 4, bb.y + bb.h - 4, 4, 4);

      // Text
      ctx.font = 'bold 9px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bb.texts[bb.currentTextIndex], bb.x + bb.w / 2, bb.y + bb.h / 2);
      ctx.restore();
    }
  }
}
