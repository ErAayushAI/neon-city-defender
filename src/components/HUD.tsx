import React from 'react';
import { PlayerStats, BuildingData } from '../game/types';
import { Shield, Zap, Pause, Volume2, VolumeX, AlertTriangle, Radio } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  level: number;
  highScore: number;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  buildings: BuildingData[];
  fps?: number;
  showFps?: boolean;
  onPause: () => void;
  onEMPClick?: () => void;
  onShieldClick?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  level,
  highScore,
  bossActive,
  bossHp,
  bossMaxHp,
  buildings,
  fps,
  showFps,
  onPause,
  onEMPClick,
  onShieldClick,
}) => {
  const hpPct = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const energyPct = Math.max(0, Math.min(100, (stats.energy / stats.maxEnergy) * 100));
  const empReady = stats.empCooldown <= 0;
  const empProgress = empReady ? 100 : (1 - stats.empCooldown / stats.empMaxCooldown) * 100;
  const comboTimePct = (stats.comboTimer / stats.maxComboTimer) * 100;

  return (
    <div id="game-hud" className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between select-none">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Health & Energy telemetry */}
        <div className="w-56 sm:w-64 space-y-2">
          {/* Health Bar */}
          <div className="cyber-panel px-3 py-2 rounded-md border-cyan-500/40">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-display font-semibold text-emerald-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> HULL INTEGRITY
              </span>
              <span className="font-mono-tech text-emerald-300 font-bold">
                {Math.round(stats.health)}/{stats.maxHealth}
              </span>
            </div>
            <div className="w-full bg-slate-900/80 h-2.5 rounded overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-sm transition-all duration-150 ${
                  hpPct > 50 ? 'bg-emerald-400' : hpPct > 25 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>

          {/* Energy Bar */}
          <div className="cyber-panel px-3 py-2 rounded-md border-cyan-500/40">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-display font-semibold text-cyan-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> SYSTEM ENERGY
              </span>
              <span className="font-mono-tech text-cyan-300 font-bold">
                {Math.round(stats.energy)}%
              </span>
            </div>
            <div className="w-full bg-slate-900/80 h-2 rounded overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full bg-cyan-400 rounded-sm transition-all duration-100 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                style={{ width: `${energyPct}%` }}
              />
            </div>
          </div>

          {/* Active Buffs Pill Row */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {stats.shieldActive && (
              <div className="px-2 py-0.5 bg-blue-900/60 border border-blue-400/60 rounded text-[10px] font-display text-blue-300 flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <Shield className="w-3 h-3 text-blue-400 animate-pulse" />
                SHIELD: {stats.shieldTimeRemaining.toFixed(1)}s
              </div>
            )}
            {stats.rapidFireActive && (
              <div className="px-2 py-0.5 bg-amber-900/60 border border-amber-400/60 rounded text-[10px] font-display text-amber-300 flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                <span className="text-amber-400">🔥</span>
                RAPID: {stats.rapidFireTimeRemaining.toFixed(1)}s
              </div>
            )}
            {stats.scoreMultiplierActive && (
              <div className="px-2 py-0.5 bg-yellow-900/60 border border-yellow-400/60 rounded text-[10px] font-display text-yellow-300 flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                <span>⚡</span>
                2X MULTIPLIER: {stats.scoreMultiplierTimeRemaining.toFixed(1)}s
              </div>
            )}
          </div>
        </div>

        {/* Top-Center: Score & Combo Multiplier */}
        <div className="flex flex-col items-center">
          <div className="cyber-panel px-6 py-2 rounded-lg border-cyan-500/40 text-center min-w-[180px] shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="text-[10px] font-display tracking-widest text-cyan-400/80 uppercase">
              DEFENSE SCORE
            </div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider">
              {stats.score.toLocaleString()}
            </div>
          </div>

          {/* Combo Multiplier Tracker */}
          {stats.combo > 0 && (
            <div className="mt-1.5 cyber-panel px-3 py-1 rounded border-amber-500/50 flex flex-col items-center shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-1.5 text-xs font-display font-bold text-amber-400">
                <span>COMBO x{stats.comboMultiplier}</span>
                <span className="text-[10px] font-mono-tech text-amber-200">({stats.combo} STREAK)</span>
              </div>
              <div className="w-28 bg-slate-900/80 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${comboTimePct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Top-Right: Sector Level & Controls */}
        <div className="flex flex-col items-end gap-2">
          <div className="cyber-panel px-4 py-2 rounded-md border-cyan-500/40 text-right min-w-[130px]">
            <div className="text-[10px] font-display text-cyan-400/80 uppercase">SECTOR WAVE</div>
            <div className="font-display font-black text-xl text-cyan-300">WAVE {level}</div>
            <div className="text-[10px] font-mono-tech text-slate-400 mt-0.5">
              HIGH: <span className="text-yellow-400 font-bold">{highScore.toLocaleString()}</span>
            </div>
          </div>

          {/* Pause Button */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {showFps && (
              <span className="text-[10px] font-mono-tech text-cyan-400 bg-slate-950/80 px-2 py-1 rounded border border-cyan-800/40">
                {fps ?? 60} FPS
              </span>
            )}
            <button
              id="pause-btn"
              onClick={onPause}
              className="p-2 rounded-md bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              title="Pause Game (Esc / P)"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Boss Health Warning Bar (If Boss CORE-X is active) */}
      {bossActive && (
        <div className="w-full max-w-xl mx-auto my-auto cyber-panel-danger px-5 py-3 rounded-lg border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse">
          <div className="flex justify-between items-center text-xs mb-1 font-display">
            <span className="text-red-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              BOSS: CORE-X DREADNOUGHT
            </span>
            <span className="text-red-300 font-mono-tech font-bold">
              {Math.max(0, Math.round(bossHp))}/{bossMaxHp} HP
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded overflow-hidden p-0.5 border border-red-900/60">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 rounded-sm transition-all duration-100 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Row: Buildings Telemetry & Ability Quick-Action Badges */}
      <div className="flex items-end justify-between gap-3">
        {/* Buildings Live Status Grid */}
        <div className="cyber-panel px-3 py-2 rounded-md border-cyan-500/30 flex flex-wrap gap-2 max-w-sm sm:max-w-md">
          <div className="text-[10px] font-display text-slate-400 w-full flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" /> SMART CITY INFRASTRUCTURE
          </div>
          {buildings.map((b) => {
            const bHpPct = Math.max(0, (b.health / b.maxHealth) * 100);
            return (
              <div
                key={b.id}
                className={`flex-1 min-w-[90px] px-2 py-1 rounded border text-[10px] transition-all ${
                  b.destroyed
                    ? 'bg-red-950/40 border-red-900/50 text-red-500'
                    : b.hackedProgress > 0
                    ? 'bg-purple-950/60 border-purple-500 text-purple-300 animate-pulse'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-200'
                }`}
              >
                <div className="font-display font-semibold truncate text-[9px]">
                  {b.type === 'ENERGY_CORE' ? 'ENERGY CORE' : b.type === 'COMM_TOWER' ? 'COMM TOWER' : 'CONTROL CTR'}
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden mt-1 border border-slate-800">
                  <div
                    className={`h-full ${
                      b.destroyed ? 'bg-red-600' : bHpPct > 50 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${bHpPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Abilities Quick Cooldown Badges */}
        <div className="hidden sm:flex items-center gap-3 pointer-events-auto">
          {/* EMP Ability Badge */}
          <button
            id="emp-badge-btn"
            onClick={onEMPClick}
            disabled={!empReady}
            className={`cyber-panel px-3 py-2 rounded-lg border flex items-center gap-2.5 transition-all ${
              empReady
                ? 'border-cyan-400 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)] cursor-pointer hover:scale-105 active:scale-95'
                : 'border-slate-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="relative w-8 h-8 rounded-full border border-cyan-500/50 flex items-center justify-center bg-cyan-950/50">
              <Zap className={`w-4 h-4 ${empReady ? 'text-cyan-300' : 'text-slate-500'}`} />
              {!empReady && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-cyan-400"
                  style={{
                    clipPath: `polygon(50% 50%, -50% -50%, ${empProgress * 2}% -50%, 50% 50%)`,
                  }}
                />
              )}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-display font-bold text-cyan-300">EMP DISCHARGE</div>
              <div className="text-[9px] font-mono-tech text-slate-400">
                {empReady ? (
                  <span className="text-cyan-400 font-bold">[SPACE] READY</span>
                ) : (
                  `${stats.empCooldown.toFixed(1)}s`
                )}
              </div>
            </div>
          </button>

          {/* Shield Ability Badge */}
          <button
            id="shield-badge-btn"
            onClick={onShieldClick}
            disabled={stats.shieldActive || stats.energy < 30}
            className={`cyber-panel px-3 py-2 rounded-lg border flex items-center gap-2.5 transition-all ${
              stats.shieldActive
                ? 'border-blue-400 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : stats.energy >= 30
                ? 'border-blue-500/50 hover:border-blue-400 cursor-pointer hover:scale-105 active:scale-95'
                : 'border-slate-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="w-8 h-8 rounded-full border border-blue-500/50 flex items-center justify-center bg-blue-950/50">
              <Shield className={`w-4 h-4 ${stats.shieldActive ? 'text-blue-300 animate-pulse' : 'text-blue-400'}`} />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-display font-bold text-blue-300">CYBER SHIELD</div>
              <div className="text-[9px] font-mono-tech text-slate-400">
                {stats.shieldActive ? (
                  <span className="text-blue-300 font-bold">ACTIVE</span>
                ) : (
                  '[E / SHIFT] (30 NRG)'
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
