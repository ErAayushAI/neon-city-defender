# 🌆 Neon City Defender

A fast-paced, 2D top-down cyberpunk smart city defense browser game built with **React**, **TypeScript**, **HTML5 Canvas**, and the **Web Audio API**.

<p align="center">
  <a href="https://neon-city-defender.vercel.app/">Live Demo</a> •
</p>


---

## 🎮 Game Concept & Lore

In the year 2088, the smart metropolis **Neo-Kyoto** faces a coordinated cyber invasion by rogue autonomous drones and AI dreadnoughts. 

As the commander of the city's aerial defense drone, your mission is to:
- **Engage and destroy** waves of hostile cyber drones (Scouts, Hunters, Heavy Tanks, and Infiltrators).
- **Protect 3 critical city infrastructure facilities**:
  - ⚡ **Energy Core**: Boosts system energy recharge rate.
  - 📡 **Communication Tower**: Scans and relays threat intelligence.
  - 🛡️ **City Control Center**: Coordinates the metropolitan defense matrix.
- **Collect power-ups**: Hull repair nanites, energy batteries, rapid-fire plasma, cyber shields, instant EMP resets, and 2x score multipliers.
- **Defeat the CORE-X Dreadnought Boss**: A multi-phase aerial warship appearing every 5 waves.
- **Survive and achieve the highest defense score**.

---

## 🚀 Key Technical Features

- **High-Performance Canvas 2D Engine**: Smooth 60 FPS rendering with custom procedural particle systems (explosions, thruster trails, sparks, shockwaves, floating combat text).
- **Procedural Synthesizer Audio (Web Audio API)**: Zero external audio files required — laser blasts, EMP shockwaves, combo chimes, and retro synthesizer music are synthesized procedurally in real-time.
- **Modular Object-Oriented Architecture**:
  - `GameEngine`: Central game loop, wave director, and entity coordinator.
  - `PlayerDrone`: Quadcopter drone physics with inertia, thrusters, aiming, and ability timers.
  - `EnemyManager`: Distinct AI archetypes (evasive zig-zagging scouts, aggressive dual-cannon hunters, armored tank juggernauts, and building-hacking infiltrators).
  - `BossCoreX`: Multi-phase dreadnought with kinetic orbiting shields, spiral energy orbs, and enraged nova attacks.
  - `BuildingManager`: Real-time health, shield regeneration, and hack progress mechanics.
  - `CollisionManager`: Circle-circle and circle-AABB spatial collision detection.
- **Universal Input Handling**: Desktop (WASD/Arrow keys, Mouse Aim & Click) and Mobile (virtual touch joystick and action buttons).
- **Local High Score Persistence**: Browser `localStorage` integration with real-time combo multiplier tracking.
- **Zero Backend Dependency**: 100% client-side execution, fully offline-capable.

---

## 🕹️ Controls

### Desktop Keyboard & Mouse
| Action | Key / Input |
|---|---|
| **Move Drone** | `W`, `A`, `S`, `D` or `Arrow Keys` |
| **Aim** | Mouse Cursor (360°) |
| **Primary Fire** | `Left Click` (Hold to continuous fire) or `J`, `F`, `Enter` |
| **EMP Shockwave** | `Spacebar`, `Q`, or `R` |
| **Cyber Shield** | `E`, `Shift`, `C`, or `Right Click` (Costs 30 Energy) |
| **Pause Game** | `Escape` or `P` |

### Touch / Mobile
- **Left Virtual Joystick**: Move drone in all directions.
- **Right Action Buttons**: Fire Laser, Trigger EMP Blast, Activate Cyber Shield.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Graphics**: HTML5 2D Canvas API
- **Audio**: Web Audio API (Procedural Oscillator Synthesizer)

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- `npm` (bundled with Node.js)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/<YOUR-USERNAME>/neon-city-defender.git
   cd neon-city-defender
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your web browser.

---

## 📦 Production Build

To build the static production bundle:
```bash
npm run build
```
The compiled assets will be in the `dist/` directory, ready to deploy to **GitHub Pages**, **Vercel**, or **Netlify**.
