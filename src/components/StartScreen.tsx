import React from 'react';
import { Play, HelpCircle, Settings as SettingsIcon, Trophy, Shield, Cpu, Zap, Activity } from 'lucide-react';
import { soundManager } from '../game/audio';

interface StartScreenProps {
  highScore: number;
  onPlay: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  onPlay,
  onHowToPlay,
  onSettings,
}) => {
  const handlePlayClick = () => {
    soundManager.playClick();
    onPlay();
  };

  const handleHelpClick = () => {
    soundManager.playClick();
    onHowToPlay();
  };

  const handleSettingsClick = () => {
    soundManager.playClick();
    onSettings();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
      {/* Background Gradient & Cyber Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Main Hero Card Container */}
      <div className="relative w-full max-w-xl cyber-panel p-6 sm:p-10 rounded-xl border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.25)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Portfolio Engineering Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[11px] font-mono-tech text-cyan-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>PORTFOLIO SHOWCASE // WEB AUDIO + CANVAS 2D ENGINE</span>
        </div>

        {/* Cyberpunk Title */}
        <div className="space-y-1">
          <h1 className="font-display font-black text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-fuchsia-400 tracking-wider drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            NEON CITY DEFENDER
          </h1>
          <p className="text-xs sm:text-sm font-display tracking-widest text-cyan-300/80 uppercase">
            DEFEND THE CITY. STOP THE CYBER INVASION.
          </p>
        </div>

        {/* High Score Trophy Box */}
        {highScore > 0 && (
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-lg bg-slate-900/80 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
            <div className="text-left">
              <div className="text-[10px] font-display text-slate-400 uppercase">HIGH SCORE RECORD</div>
              <div className="text-lg font-display font-bold text-yellow-300">
                {highScore.toLocaleString()} PTS
              </div>
            </div>
          </div>
        )}

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 py-1 text-left">
          <div className="p-2.5 rounded bg-slate-900/60 border border-cyan-900/60 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="text-[10px]">
              <div className="font-display font-semibold text-slate-200">3 Smart Buildings</div>
              <div className="text-slate-400 text-[9px]">Protect city grid</div>
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-900/60 border border-cyan-900/60 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-[10px]">
              <div className="font-display font-semibold text-slate-200">EMP & Shield</div>
              <div className="text-slate-400 text-[9px]">Cyber abilities</div>
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-900/60 border border-cyan-900/60 flex items-center gap-2">
            <Activity className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <div className="text-[10px]">
              <div className="font-display font-semibold text-slate-200">CORE-X Boss</div>
              <div className="text-slate-400 text-[9px]">Every 5 sectors</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            id="start-play-btn"
            onClick={handlePlayClick}
            className="w-full py-3.5 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-black text-lg tracking-wider transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            PLAY NOW
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="how-to-play-btn"
              onClick={handleHelpClick}
              className="py-2.5 px-4 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-display font-bold text-xs tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              HOW TO PLAY
            </button>
            <button
              id="settings-btn"
              onClick={handleSettingsClick}
              className="py-2.5 px-4 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-display font-bold text-xs tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            >
              <SettingsIcon className="w-4 h-4 text-cyan-400" />
              SETTINGS
            </button>
          </div>
        </div>

        {/* Bottom Specs Line */}
        <div className="text-[10px] font-mono-tech text-slate-500 flex justify-center gap-4">
          <span>CANVAS 2D 60FPS</span>
          <span>•</span>
          <span>NO BACKEND REQUIRED</span>
          <span>•</span>
          <span>STANDALONE WEB APP</span>
        </div>
      </div>
    </div>
  );
};
