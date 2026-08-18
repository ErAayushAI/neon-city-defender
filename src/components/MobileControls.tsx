import React, { useRef, useState, useEffect } from 'react';
import { Crosshair, Zap, Shield } from 'lucide-react';
import { PlayerStats } from '../game/types';

interface MobileControlsProps {
  stats: PlayerStats;
  onMove: (vx: number, vy: number) => void;
  onShoot: (isShooting: boolean) => void;
  onEMP: () => void;
  onShield: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  stats,
  onMove,
  onShoot,
  onEMP,
  onShield,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const empReady = stats.empCooldown <= 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 10;

    if (dist > 0) {
      const clampedDist = Math.min(dist, maxRadius);
      const nx = (dx / dist) * clampedDist;
      const ny = (dy / dist) * clampedDist;
      setKnobPos({ x: nx, y: ny });
      onMove(dx / maxRadius, dy / maxRadius);
    } else {
      setKnobPos({ x: 0, y: 0 });
      onMove(0, 0);
    }
  };

  return (
    <div id="mobile-controls-layer" className="absolute inset-0 pointer-events-none flex justify-between items-end p-4 sm:hidden z-10 select-none">
      {/* Virtual Joystick (Bottom-Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-32 h-32 rounded-full border-2 border-cyan-500/40 bg-slate-950/60 backdrop-blur-sm pointer-events-auto relative flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]"
      >
        {/* Direction Guidelines */}
        <div className="absolute w-full h-[1px] bg-cyan-500/20" />
        <div className="absolute h-full w-[1px] bg-cyan-500/20" />

        {/* Floating Thumb Knob */}
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-white shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Action Touch Buttons (Bottom-Right) */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {/* Top Row: Shield & EMP */}
        <div className="flex gap-2.5">
          {/* Shield Button */}
          <button
            id="mobile-shield-btn"
            onTouchStart={(e) => {
              e.preventDefault();
              onShield();
            }}
            disabled={stats.shieldActive || stats.energy < 30}
            className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center text-[9px] font-display font-bold shadow-lg active:scale-90 transition ${
              stats.shieldActive
                ? 'border-blue-400 bg-blue-900/80 text-blue-200'
                : stats.energy >= 30
                ? 'border-blue-500 bg-slate-900/80 text-blue-300'
                : 'border-slate-800 bg-slate-950/60 text-slate-600 opacity-50'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            SHIELD
          </button>

          {/* EMP Button */}
          <button
            id="mobile-emp-btn"
            onTouchStart={(e) => {
              e.preventDefault();
              onEMP();
            }}
            disabled={!empReady}
            className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center text-[9px] font-display font-bold shadow-lg active:scale-90 transition ${
              empReady
                ? 'border-fuchsia-400 bg-fuchsia-950/80 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                : 'border-slate-800 bg-slate-950/60 text-slate-600 opacity-50'
            }`}
          >
            <Zap className="w-5 h-5 mb-0.5" />
            EMP
          </button>
        </div>

        {/* Bottom Primary Fire Button (Large) */}
        <button
          id="mobile-fire-btn"
          onTouchStart={(e) => {
            e.preventDefault();
            onShoot(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onShoot(false);
          }}
          className="w-20 h-20 rounded-full border-2 border-cyan-400 bg-gradient-to-tr from-cyan-600 to-sky-400 text-slate-950 font-display font-black text-xs shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-95 transition flex flex-col items-center justify-center gap-1"
        >
          <Crosshair className="w-7 h-7" />
          FIRE
        </button>
      </div>
    </div>
  );
};
