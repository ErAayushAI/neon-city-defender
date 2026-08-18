import React, { useState } from 'react';
import { X, Gamepad2, Shield, Zap, Crosshair, Skull, Award } from 'lucide-react';
import { soundManager } from '../game/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'controls' | 'objectives' | 'enemies' | 'powerups'>('controls');

  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-2xl cyber-panel p-5 sm:p-7 rounded-xl border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] max-h-[90vh] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-black text-xl text-cyan-300 tracking-wide">
              TACTICAL FIELD MANUAL
            </h2>
          </div>
          <button
            id="close-manual-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'controls', label: 'Controls', icon: Crosshair },
            { id: 'objectives', label: 'Objectives', icon: Shield },
            { id: 'enemies', label: 'Threat Intel', icon: Skull },
            { id: 'powerups', label: 'Power-Ups', icon: Zap },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  soundManager.playClick();
                  setTab(t.id as typeof tab);
                }}
                className={`px-3 py-1.5 rounded-md font-display text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs text-slate-300 leading-relaxed font-sans max-h-[55vh]">
          {tab === 'controls' && (
            <div className="space-y-4">
              <div className="cyber-panel p-3 rounded-lg border-cyan-900/60 space-y-2">
                <h3 className="font-display font-bold text-cyan-400 text-sm">DESKTOP CONTROLS</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="font-mono-tech text-cyan-300 font-bold">[W][A][S][D] / ARROWS</span>
                    <p className="text-slate-400 mt-0.5">Move Drone in all 8 directions</p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="font-mono-tech text-cyan-300 font-bold">[MOUSE AIM + LEFT CLICK]</span>
                    <p className="text-slate-400 mt-0.5">Aim 360° and continuous primary laser</p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="font-mono-tech text-cyan-300 font-bold">[SPACEBAR]</span>
                    <p className="text-slate-400 mt-0.5">Release 360° EMP Blast (Wipes bullets & enemies)</p>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                    <span className="font-mono-tech text-cyan-300 font-bold">[E] / [SHIFT] / RIGHT-CLICK</span>
                    <p className="text-slate-400 mt-0.5">Activate Invulnerable Cyber Shield (Costs 30 Energy)</p>
                  </div>
                </div>
              </div>

              <div className="cyber-panel p-3 rounded-lg border-cyan-900/60 space-y-2">
                <h3 className="font-display font-bold text-cyan-400 text-sm">MOBILE & TOUCH CONTROLS</h3>
                <p className="text-slate-400 text-[11px]">
                  On touchscreen devices, use the virtual floating thumbstick on the left to navigate, and tap/hold the right action buttons to aim, fire lasers, discharge EMP, and activate shields.
                </p>
              </div>
            </div>
          )}

          {tab === 'objectives' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                <h3 className="font-display font-bold text-cyan-300 text-sm mb-1">
                  PRIMARY MISSION: SMART CITY DEFENSE
                </h3>
                <p>
                  Hostile cyber swarms have invaded the metropolitan grid. You must protect the 3 vital smart city infrastructure hubs. If all 3 buildings fall, the metropolitan matrix collapses and the game is lost.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded bg-slate-900/80 border border-cyan-500/40 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-400 flex items-center justify-center font-display font-bold text-cyan-400 shrink-0">
                    ⚡
                  </div>
                  <div>
                    <div className="font-display font-bold text-cyan-300 text-xs">1. ENERGY CORE (South-West)</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Powers the municipal power grid. Flying near this facility increases your drone energy recharge rate by +50%.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/80 border border-fuchsia-500/40 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-fuchsia-950 border border-fuchsia-400 flex items-center justify-center font-display font-bold text-fuchsia-400 shrink-0">
                    📡
                  </div>
                  <div>
                    <div className="font-display font-bold text-fuchsia-300 text-xs">2. COMMUNICATION TOWER (North-Center)</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Relays threat radar telemetry and scanner intelligence.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/80 border border-blue-500/40 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-blue-950 border border-blue-400 flex items-center justify-center font-display font-bold text-blue-400 shrink-0">
                    🛡️
                  </div>
                  <div>
                    <div className="font-display font-bold text-blue-300 text-xs">3. CITY CONTROL CENTER (South-East)</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mainframe coordinating peripheral energy shields and autonomous defense routines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'enemies' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded bg-slate-900/80 border border-red-500/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-red-400">SCOUT DRONE</span>
                  <span className="font-mono-tech text-yellow-400 font-bold">100 PTS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fast, nimble interceptor with evasive zig-zag patterns. Fires light rapid lasers.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-orange-500/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-orange-400">HUNTER DRONE</span>
                  <span className="font-mono-tech text-yellow-400 font-bold">200 PTS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Medium-weight pursuer. Directly tracks player drone and unleashes 2-round plasma bursts.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-red-600/40 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-rose-400">TANK DRONE</span>
                  <span className="font-mono-tech text-yellow-400 font-bold">400 PTS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Heavy armor juggernaut. Fires massive high-damage plasma shells.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-purple-500/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-purple-400">CYBER HACKER</span>
                  <span className="font-mono-tech text-yellow-400 font-bold">500 PTS</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Stealth unit that targets buildings directly with data siphon beams. Eliminate with high priority!
                </p>
              </div>

              <div className="sm:col-span-2 p-3 rounded bg-red-950/40 border border-red-500/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-display font-black text-red-400 text-sm">BOSS: CORE-X DREADNOUGHT</span>
                  <span className="font-mono-tech text-yellow-300 font-black text-sm">2,500 PTS</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Appears every 5 sectors (Level 5, 10, 15...). Features multi-phase combat, kinetic orbiting shields, spiral energy orbs, and minion deployment.
                </p>
              </div>
            </div>
          )}

          {tab === 'powerups' && (
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-slate-900/80 border border-emerald-500/40">
                <div className="font-display font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>+</span> HEALTH REPAIR
                </div>
                <p className="text-slate-400 mt-1">Restores 35 Hull Integrity immediately.</p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-cyan-500/40">
                <div className="font-display font-bold text-cyan-400 flex items-center gap-1.5">
                  <span>⚡</span> ENERGY CELL
                </div>
                <p className="text-slate-400 mt-1">Refills 50 System Energy instantly.</p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-amber-500/40">
                <div className="font-display font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🔥</span> RAPID FIRE
                </div>
                <p className="text-slate-400 mt-1">Triples firing cadence with plasma bolts for 8 seconds.</p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-blue-500/40">
                <div className="font-display font-bold text-blue-400 flex items-center gap-1.5">
                  <span>🛡️</span> CYBER SHIELD
                </div>
                <p className="text-slate-400 mt-1">Grants temporary invulnerability for 7 seconds.</p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-fuchsia-500/40">
                <div className="font-display font-bold text-fuchsia-400 flex items-center gap-1.5">
                  <span>💥</span> EMP OVERDRIVE
                </div>
                <p className="text-slate-400 mt-1">Instantly resets EMP cooldown ready for immediate release.</p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-yellow-500/40">
                <div className="font-display font-bold text-yellow-400 flex items-center gap-1.5">
                  <span>2X</span> DOUBLE SCORE
                </div>
                <p className="text-slate-400 mt-1">Doubles all destruction & combo scores for 10 seconds.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            id="close-manual-bottom-btn"
            onClick={handleClose}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs tracking-wider transition cursor-pointer"
          >
            UNDERSTOOD // RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
