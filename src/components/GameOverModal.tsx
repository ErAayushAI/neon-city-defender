import React from 'react';
import { RotateCcw, Home, Trophy, Skull, Shield, Award, Zap } from 'lucide-react';
import { PlayerStats, BuildingData } from '../game/types';
import { soundManager } from '../game/audio';

interface GameOverModalProps {
  stats: PlayerStats;
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  buildings: BuildingData[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  level,
  highScore,
  isNewHighScore,
  buildings,
  onPlayAgain,
  onMainMenu,
}) => {
  const buildingsSaved = buildings.filter((b) => !b.destroyed).length;

  const handlePlayAgain = () => {
    soundManager.playClick();
    onPlayAgain();
  };

  const handleMainMenu = () => {
    soundManager.playClick();
    onMainMenu();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg cyber-panel p-6 sm:p-8 rounded-xl border-red-500/60 shadow-[0_0_45px_rgba(239,68,68,0.35)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* New Record Banner if beaten */}
        {isNewHighScore && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-950/80 border border-yellow-400 text-yellow-300 font-display text-xs font-bold shadow-[0_0_20px_rgba(234,179,8,0.5)] animate-bounce">
            <Trophy className="w-4 h-4 text-yellow-400" />
            NEW ALL-TIME HIGH SCORE!
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <div className="text-xs font-mono-tech tracking-widest text-red-400 uppercase">
            // DEFENSE PERIMETER COMPROMISED //
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-red-400 tracking-wider drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            GAME OVER
          </h2>
        </div>

        {/* Big Score Box */}
        <div className="cyber-panel p-4 rounded-xl border-cyan-500/40 bg-slate-950/90 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="text-[11px] font-display text-cyan-400/80 uppercase">FINAL MISSION SCORE</div>
          <div className="font-display font-black text-4xl sm:text-5xl text-white tracking-wider my-1">
            {stats.score.toLocaleString()}
          </div>
          <div className="text-xs font-mono-tech text-slate-400 flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            ALL-TIME RECORD: <span className="text-yellow-400 font-bold">{highScore.toLocaleString()} PTS</span>
          </div>
        </div>

        {/* Mission Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-display text-slate-400">SECTOR LEVEL</div>
            <div className="text-base font-display font-bold text-cyan-300 mt-0.5">WAVE {level}</div>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-display text-slate-400 flex items-center gap-1">
              <Skull className="w-3 h-3 text-red-400" /> ELIMINATED
            </div>
            <div className="text-base font-display font-bold text-red-400 mt-0.5">
              {stats.enemiesDestroyed} DRONES
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-display text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" /> SAVED
            </div>
            <div className="text-base font-display font-bold text-emerald-400 mt-0.5">
              {buildingsSaved}/3 HUBS
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-display text-slate-400 flex items-center gap-1">
              <Award className="w-3 h-3 text-fuchsia-400" /> BOSSES
            </div>
            <div className="text-base font-display font-bold text-fuchsia-400 mt-0.5">
              {stats.bossesDefeated} DEFEATED
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            id="gameover-play-again-btn"
            onClick={handlePlayAgain}
            className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-base tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 fill-current" />
            REDEPLOY DRONE (PLAY AGAIN)
          </button>

          <button
            id="gameover-main-menu-btn"
            onClick={handleMainMenu}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-cyan-300 font-display font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
