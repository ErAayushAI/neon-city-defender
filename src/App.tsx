/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameState, GameSettings, PlayerStats, BuildingData } from './game/types';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { MobileControls } from './components/MobileControls';
import { soundManager } from './game/audio';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('START');
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(1);
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [fps, setFps] = useState(60);

  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    screenShake: true,
    glowEffects: true,
    autoFire: false,
    showFps: false,
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    score: 0,
    combo: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    maxComboTimer: 4.5,
    level: 1,
    empCooldown: 0,
    empMaxCooldown: 10.0,
    shieldActive: false,
    shieldTimeRemaining: 0,
    shieldMaxDuration: 6.0,
    rapidFireActive: false,
    rapidFireTimeRemaining: 0,
    scoreMultiplierActive: false,
    scoreMultiplierTimeRemaining: 0,
    enemiesDestroyed: 0,
    bossesDefeated: 0,
  });

  // Initialize Canvas & Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 1280;
    canvas.height = 720;

    let engine = engineRef.current;
    if (!engine) {
      engine = new GameEngine(canvas);
      engineRef.current = engine;

      engine.onStateChange = (newState) => {
        setGameState(newState);
        if (newState === 'GAME_OVER') {
          setIsNewHighScore(engine!.isNewHighScore);
          setHighScore(engine!.currentHighScore);
        }
      };

      engine.onStatsUpdate = (stats, curLevel, isBoss, bHp, bMaxHp) => {
        setPlayerStats({ ...stats });
        setLevel(curLevel);
        setBossActive(isBoss);
        setBossHp(bHp);
        setBossMaxHp(bMaxHp);
        setBuildings([...engine!.buildingManager.getBuildings()]);
        setFps(engine!.fps);
      };

      setHighScore(engine.currentHighScore);
      setBuildings([...engine.buildingManager.getBuildings()]);
    } else {
      engine.inputManager.bindCanvas(canvas);
    }

    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  // ResizeObserver for maintaining 16:9 canvas crispness
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      if (!canvasRef.current || !engineRef.current) return;
      const { clientWidth, clientHeight } = container;

      // Desired 16:9 aspect ratio dimensions
      const targetAspect = 16 / 9;
      let w = clientWidth;
      let h = clientWidth / targetAspect;

      if (h > clientHeight) {
        h = clientHeight;
        w = clientHeight * targetAspect;
      }

      // Keep native internal canvas buffer high-res (1280x720) for consistent game physics
      canvasRef.current.style.width = `${Math.floor(w)}px`;
      canvasRef.current.style.height = `${Math.floor(h)}px`;
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    handleResize();

    return () => observer.disconnect();
  }, []);

  // Handlers
  const handlePlay = useCallback(() => {
    window.focus();
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  }, []);

  const handleResume = useCallback(() => {
    window.focus();
    if (engineRef.current) {
      engineRef.current.setState('PLAYING');
    }
  }, []);

  const handleRestart = useCallback(() => {
    window.focus();
    if (engineRef.current) {
      engineRef.current.startNewGame();
    }
  }, []);

  const handleMainMenu = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setState('START');
    }
  }, []);

  const handlePause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setState('PAUSED');
    }
  }, []);

  const handleUpdateSettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    if (engineRef.current) {
      engineRef.current.settings = { ...newSettings };
    }
  }, []);

  const handleClearHighScores = useCallback(() => {
    localStorage.removeItem('neon_city_defender_highscores');
    setHighScore(0);
    if (engineRef.current) {
      engineRef.current.highScores = [];
      engineRef.current.currentHighScore = 0;
    }
  }, []);

  // Mobile virtual inputs
  const handleMobileMove = useCallback((vx: number, vy: number) => {
    if (engineRef.current) {
      engineRef.current.inputManager.setVirtualMovement(vx, vy);
    }
  }, []);

  const handleMobileShoot = useCallback((isShooting: boolean) => {
    if (engineRef.current) {
      engineRef.current.inputManager.setVirtualShooting(isShooting);
    }
  }, []);

  const handleEMP = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.inputManager.onEMP?.();
    }
  }, []);

  const handleShield = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.inputManager.onShield?.();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id="app-root"
      className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* 16:9 Game Viewport Wrapper */}
      <div className="relative overflow-hidden rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] border border-slate-900 flex items-center justify-center">
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          id="game-canvas"
          className="block bg-slate-950 cursor-crosshair"
        />

        {/* Scanlines Effect Overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-70" />

        {/* Active HUD in Playing state */}
        {gameState === 'PLAYING' && (
          <>
            <HUD
              stats={playerStats}
              level={level}
              highScore={highScore}
              bossActive={bossActive}
              bossHp={bossHp}
              bossMaxHp={bossMaxHp}
              buildings={buildings}
              fps={fps}
              showFps={settings.showFps}
              onPause={handlePause}
              onEMPClick={handleEMP}
              onShieldClick={handleShield}
            />
            <MobileControls
              stats={playerStats}
              onMove={handleMobileMove}
              onShoot={handleMobileShoot}
              onEMP={handleEMP}
              onShield={handleShield}
            />
          </>
        )}

        {/* Start Screen */}
        {gameState === 'START' && (
          <StartScreen
            highScore={highScore}
            onPlay={handlePlay}
            onHowToPlay={() => setGameState('HOW_TO_PLAY')}
            onSettings={() => setGameState('SETTINGS')}
          />
        )}

        {/* How to Play Manual Modal */}
        {gameState === 'HOW_TO_PLAY' && (
          <HowToPlayModal
            onClose={() => setGameState(engineRef.current?.player.stats.score ? 'PAUSED' : 'START')}
          />
        )}

        {/* Settings Modal */}
        {gameState === 'SETTINGS' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setGameState(engineRef.current?.player.stats.score ? 'PAUSED' : 'START')}
            onClearHighScores={handleClearHighScores}
          />
        )}

        {/* Pause Menu Modal */}
        {gameState === 'PAUSED' && (
          <PauseMenu
            onResume={handleResume}
            onRestart={handleRestart}
            onSettings={() => setGameState('SETTINGS')}
            onMainMenu={handleMainMenu}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'GAME_OVER' && (
          <GameOverModal
            stats={playerStats}
            level={level}
            highScore={highScore}
            isNewHighScore={isNewHighScore}
            buildings={buildings}
            onPlayAgain={handleRestart}
            onMainMenu={handleMainMenu}
          />
        )}
      </div>
    </div>
  );
}
