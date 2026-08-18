import React from 'react';
import { X, Volume2, Sparkles, Monitor, Crosshair, RefreshCw } from 'lucide-react';
import { GameSettings } from '../game/types';
import { soundManager } from '../game/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
  onClearHighScores?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onClearHighScores,
}) => {
  const handleClose = () => {
    soundManager.playClick();
    onClose();
  };

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    soundManager.updateSettings(updated);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md cyber-panel p-5 sm:p-7 rounded-xl border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-black text-lg text-cyan-300 tracking-wide">
              SYSTEM CONFIGURATION
            </h2>
          </div>
          <button
            id="close-settings-btn"
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders & Toggles */}
        <div className="space-y-4 text-xs">
          {/* Audio Sliders */}
          <div className="cyber-panel p-3 rounded-lg border-cyan-900/60 space-y-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-display font-bold">
              <Volume2 className="w-4 h-4" /> AUDIO SYNTHESIZER
            </div>

            {/* Master Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Master Volume</span>
                <span className="font-mono-tech text-cyan-400">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                id="master-vol-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => updateSetting('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* SFX Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Sound FX</span>
                <span className="font-mono-tech text-cyan-400">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                id="sfx-vol-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Music Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Synthwave Music</span>
                <span className="font-mono-tech text-cyan-400">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                id="music-vol-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Visual & Gameplay Toggles */}
          <div className="cyber-panel p-3 rounded-lg border-cyan-900/60 space-y-2.5">
            <div className="flex items-center gap-1.5 text-cyan-400 font-display font-bold">
              <Sparkles className="w-4 h-4" /> GRAPHICS & COMBAT
            </div>

            {/* Screen Shake Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900/60 cursor-pointer">
              <span className="text-slate-300">Explosion Screen Shake</span>
              <input
                id="screen-shake-toggle"
                type="checkbox"
                checked={settings.screenShake}
                onChange={(e) => updateSetting('screenShake', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            {/* Glow / Bloom FX Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900/60 cursor-pointer">
              <span className="text-slate-300">Neon Glow & Bloom FX</span>
              <input
                id="glow-effects-toggle"
                type="checkbox"
                checked={settings.glowEffects}
                onChange={(e) => updateSetting('glowEffects', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            {/* Auto-Fire Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900/60 cursor-pointer">
              <span className="text-slate-300">Continuous Auto-Fire</span>
              <input
                id="auto-fire-toggle"
                type="checkbox"
                checked={settings.autoFire}
                onChange={(e) => updateSetting('autoFire', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            {/* FPS Toggle */}
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900/60 cursor-pointer">
              <span className="text-slate-300">Display Diagnostics (FPS)</span>
              <input
                id="fps-toggle"
                type="checkbox"
                checked={settings.showFps}
                onChange={(e) => updateSetting('showFps', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Reset High Score */}
          {onClearHighScores && (
            <button
              id="clear-highscores-btn"
              onClick={() => {
                soundManager.playClick();
                onClearHighScores();
              }}
              className="w-full py-2 px-3 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 text-red-300 font-display text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              RESET LOCAL HIGH SCORES
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800">
          <button
            id="save-settings-btn"
            onClick={handleClose}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs tracking-wider transition cursor-pointer"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
};
