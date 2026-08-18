// Web Audio API Procedural Sound Engine
import { GameSettings } from './types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private settings: GameSettings = {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    screenShake: true,
    glowEffects: true,
    autoFire: false,
    showFps: false,
  };

  // Music loop state
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private musicGainNode: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public updateSettings(settings: GameSettings) {
    this.settings = { ...settings };
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(
        this.settings.masterVolume * this.settings.musicVolume * 0.25,
        this.ctx.currentTime
      );
    }
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.musicGainNode && this.ctx) {
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(
        this.settings.masterVolume * this.settings.musicVolume * 0.25,
        this.ctx.currentTime
      );
      this.musicGainNode.connect(this.ctx.destination);
    }
  }

  // --- SOUND EFFECTS ---

  // Normal Laser Shot (Player)
  public playLaser() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.18;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio fallback
    }
  }

  // Rapid Fire Laser
  public playRapidLaser() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.15;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore audio error
    }
  }

  // Enemy Laser Shot
  public playEnemyLaser() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.12;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Ignore audio error
    }
  }

  // EMP Blast: Sub-bass boom + White noise discharge
  public playEMP() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;

      // Sub oscillator
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(280, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

      const subVol = this.settings.masterVolume * this.settings.sfxVolume * 0.5;
      subGain.gain.setValueAtTime(subVol, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.85);

      // Cyber electric noise burst
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 0.6);
      noiseFilter.Q.setValueAtTime(4, now);

      const noiseGain = this.ctx.createGain();
      const noiseVol = this.settings.masterVolume * this.settings.sfxVolume * 0.4;
      noiseGain.gain.setValueAtTime(noiseVol, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.65);
    } catch {
      // Ignore audio error
    }
  }

  // Explosion (Small & Medium Drones)
  public playExplosion(isLarge: boolean = false) {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const duration = isLarge ? 0.7 : 0.35;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isLarge ? 600 : 900, now);
      filter.frequency.exponentialRampToValueAtTime(40, now + duration);

      const gain = this.ctx.createGain();
      const vol = this.settings.masterVolume * this.settings.sfxVolume * (isLarge ? 0.45 : 0.28);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.05);
    } catch {
      // Ignore
    }
  }

  // Power-up Collected Arpeggio
  public playPowerUp() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.2;
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.16);
      });
    } catch {
      // Ignore
    }
  }

  // Player Shield Activated
  public playShieldActivate() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.25;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // Player Damage Received
  public playPlayerHit() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.2);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.3;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  // Boss Alarm Siren
  public playBossAlarm() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const start = now + i * 0.35;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, start);
        osc.frequency.exponentialRampToValueAtTime(300, start + 0.3);

        const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.35;
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.34);
      }
    } catch {
      // Ignore
    }
  }

  // Building Alarm / Damage Warning
  public playBuildingAlert() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.2;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  // Combo Milestone Stinger
  public playComboUp(tier: number) {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 440 * Math.pow(1.2, tier);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.22;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  // Button UI Click Sound
  public playClick() {
    if (!this.ctx || this.isMuted || this.settings.sfxVolume <= 0) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

      const vol = this.settings.masterVolume * this.settings.sfxVolume * 0.1;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  // --- PROCEDURAL CYBERPUNK SYNTH MUSIC GENERATOR ---
  public startMusic() {
    if (this.musicInterval) return;
    this.init();

    // 16-step synthwave cyber baseline & arpeggios
    const bassNotes = [55, 55, 55, 55, 65.41, 65.41, 73.42, 73.42, 55, 55, 82.41, 82.41, 65.41, 65.41, 48.99, 48.99]; // A1, C2, D2, E2, G1
    const leadNotes = [220, 261.63, 329.63, 440, 392, 329.63, 261.63, 220, 329.63, 392, 523.25, 440, 329.63, 261.63, 220, 164.81];

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted || this.settings.musicVolume <= 0 || !this.musicGainNode) {
        this.musicStep = (this.musicStep + 1) % 16;
        return;
      }

      try {
        const now = this.ctx.currentTime;
        const bassFreq = bassNotes[this.musicStep];
        const leadFreq = leadNotes[this.musicStep];

        // Bass Synth
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFilter = this.ctx.createBiquadFilter();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(320, now);
        bassFilter.frequency.exponentialRampToValueAtTime(100, now + 0.12);

        bassGain.gain.setValueAtTime(0.3, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGainNode);

        bassOsc.start(now);
        bassOsc.stop(now + 0.14);

        // Neon Arp Synth on every 2nd step
        if (this.musicStep % 2 === 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'sine';
          leadOsc.frequency.setValueAtTime(leadFreq, now);

          leadGain.gain.setValueAtTime(0.12, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          leadOsc.connect(leadGain);
          leadGain.connect(this.musicGainNode);

          leadOsc.start(now);
          leadOsc.stop(now + 0.11);
        }

        // Cyber Hi-hat on every 4th step
        if (this.musicStep % 4 === 2) {
          const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
          const hhSource = this.ctx.createBufferSource();
          hhSource.buffer = buf;
          const hhFilter = this.ctx.createBiquadFilter();
          hhFilter.type = 'highpass';
          hhFilter.frequency.setValueAtTime(8000, now);
          const hhGain = this.ctx.createGain();
          hhGain.gain.setValueAtTime(0.08, now);
          hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

          hhSource.connect(hhFilter);
          hhFilter.connect(hhGain);
          hhGain.connect(this.musicGainNode);
          hhSource.start(now);
          hhSource.stop(now + 0.035);
        }

        this.musicStep = (this.musicStep + 1) % 16;
      } catch {
        // Ignore loop glitch
      }
    }, 130); // ~115 BPM
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundEngine();
