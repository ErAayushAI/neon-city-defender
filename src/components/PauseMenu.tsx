import React from 'react';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';
import { soundManager } from '../game/audio';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
}) => {
  const handleAction = (cb: () => void) => {
    soundManager.playClick();
    cb();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm cyber-panel p-6 sm:p-8 rounded-xl border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-1">
          <div className="text-[10px] font-mono-tech tracking-widest text-cyan-400 uppercase">
            // SIMULATION PAUSED //
          </div>
          <h2 className="font-display font-black text-2xl text-white tracking-wider">
            MISSION SUSPENDED
          </h2>
        </div>

        {/* Buttons Stack */}
        <div className="space-y-2.5 pt-2">
          <button
            id="resume-game-btn"
            onClick={() => handleAction(onResume)}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Play className="w-4 h-4 fill-current" />
            RESUME DEFENSE
          </button>

          <button
            id="restart-game-btn"
            onClick={() => handleAction(onRestart)}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-display font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            RESTART MISSION
          </button>

          <button
            id="pause-settings-btn"
            onClick={() => handleAction(onSettings)}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 font-display font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            CONFIGURATION
          </button>

          <button
            id="main-menu-btn"
            onClick={() => handleAction(onMainMenu)}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900/80 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 font-display font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            ABORT TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
