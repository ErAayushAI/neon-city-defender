// Unified Input Management System (Desktop Keyboard/Mouse & Mobile Touch Controls)
import { Vector2D } from './types';

export class InputManager {
  public moveDir: Vector2D = { x: 0, y: 0 };
  public aimPos: Vector2D = { x: 640, y: 260 };
  public isShooting: boolean = false;
  public keysPressed: Record<string, boolean> = {};

  // Custom callback hooks
  public onEMP?: () => void;
  public onShield?: () => void;
  public onPause?: () => void;

  private canvasElement: HTMLCanvasElement | null = null;
  private isListening: boolean = false;
  private cleanupFns: Array<() => void> = [];

  constructor() {
    this.init();
  }

  public init() {
    if (this.isListening) return;
    this.isListening = true;
    this.setupKeyboardListeners();
    if (this.canvasElement) {
      this.setupMouseListeners(this.canvasElement);
    }
  }

  public bindCanvas(canvas: HTMLCanvasElement) {
    this.canvasElement = canvas;
    this.aimPos = { x: canvas.width / 2, y: canvas.height / 2 - 120 };
    this.setupMouseListeners(canvas);
  }

  private isKey(e: KeyboardEvent, codeNames: string[], keyNames: string[]): boolean {
    if (codeNames.includes(e.code)) return true;
    const lowerKey = e.key ? e.key.toLowerCase() : '';
    return keyNames.includes(lowerKey);
  }

  private setupKeyboardListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keysPressed[e.code] = true;
      if (e.key) {
        this.keysPressed[e.key.toLowerCase()] = true;
      }

      // Prevent page scrolling on Game Keys
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code) ||
        [' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key ? e.key.toLowerCase() : '')
      ) {
        e.preventDefault();
      }

      // Movement check
      this.updateMovementFromKeys();

      // Firing with Keyboard (Space / J / F / Enter / Z / X)
      if (this.isKey(e, ['KeyJ', 'KeyF', 'Enter', 'KeyZ', 'KeyX'], ['j', 'f', 'enter', 'z', 'x'])) {
        this.isShooting = true;
      }

      // EMP Trigger (Space / Q / R)
      if (this.isKey(e, ['Space', 'KeyQ', 'KeyR'], [' ', 'q', 'r'])) {
        if (this.onEMP) this.onEMP();
      }

      // Shield Trigger (E / Shift / C)
      if (
        this.isKey(
          e,
          ['KeyE', 'ShiftLeft', 'ShiftRight', 'KeyC'],
          ['e', 'shift', 'c']
        )
      ) {
        if (this.onShield) this.onShield();
      }

      // Pause Trigger (Escape / P)
      if (this.isKey(e, ['Escape', 'KeyP'], ['escape', 'p'])) {
        if (this.onPause) this.onPause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keysPressed[e.code] = false;
      if (e.key) {
        this.keysPressed[e.key.toLowerCase()] = false;
      }

      if (this.isKey(e, ['KeyJ', 'KeyF', 'Enter', 'KeyZ', 'KeyX'], ['j', 'f', 'enter', 'z', 'x'])) {
        this.isShooting = false;
      }

      this.updateMovementFromKeys();
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    this.cleanupFns.push(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    });
  }

  private updateMovementFromKeys() {
    let dx = 0;
    let dy = 0;

    const isUp =
      this.keysPressed['KeyW'] ||
      this.keysPressed['ArrowUp'] ||
      this.keysPressed['w'] ||
      this.keysPressed['arrowup'];
    const isDown =
      this.keysPressed['KeyS'] ||
      this.keysPressed['ArrowDown'] ||
      this.keysPressed['s'] ||
      this.keysPressed['arrowdown'];
    const isLeft =
      this.keysPressed['KeyA'] ||
      this.keysPressed['ArrowLeft'] ||
      this.keysPressed['a'] ||
      this.keysPressed['arrowleft'];
    const isRight =
      this.keysPressed['KeyD'] ||
      this.keysPressed['ArrowRight'] ||
      this.keysPressed['d'] ||
      this.keysPressed['arrowright'];

    if (isUp) dy -= 1;
    if (isDown) dy += 1;
    if (isLeft) dx -= 1;
    if (isRight) dx += 1;

    // Normalize vector length
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      this.moveDir.x = dx / len;
      this.moveDir.y = dy / len;
    } else {
      this.moveDir.x = 0;
      this.moveDir.y = 0;
    }
  }

  private setupMouseListeners(canvas: HTMLCanvasElement) {
    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!this.canvasElement) return;
      const rect = this.canvasElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const scaleX = this.canvasElement.width / rect.width;
      const scaleY = this.canvasElement.height / rect.height;

      this.aimPos.x = Math.max(0, Math.min(this.canvasElement.width, (clientX - rect.left) * scaleX));
      this.aimPos.y = Math.max(0, Math.min(this.canvasElement.height, (clientY - rect.top) * scaleY));
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onMouseDown = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
      if (e.button === 0) {
        this.isShooting = true;
      } else if (e.button === 2) {
        if (this.onShield) this.onShield();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        this.isShooting = false;
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Touch support for direct canvas taps/drags
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        this.isShooting = true;
      }
    };

    const onTouchEnd = () => {
      this.isShooting = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });

    this.cleanupFns.push(() => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    });
  }

  // Mobile virtual joystick input bridge
  public setVirtualMovement(vx: number, vy: number) {
    this.moveDir.x = vx;
    this.moveDir.y = vy;
  }

  public setVirtualAim(ax: number, ay: number) {
    this.aimPos.x = ax;
    this.aimPos.y = ay;
  }

  public setVirtualShooting(shooting: boolean) {
    this.isShooting = shooting;
  }

  public reset() {
    this.moveDir = { x: 0, y: 0 };
    this.isShooting = false;
    this.keysPressed = {};
  }

  public destroy() {
    for (const fn of this.cleanupFns) {
      fn();
    }
    this.cleanupFns = [];
    this.isListening = false;
  }
}
