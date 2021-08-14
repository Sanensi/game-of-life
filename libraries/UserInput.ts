import { Emitter } from "./TypedEventEmitter";
import { Vec2 } from "./Vec2";

interface UserInputEvents {
  'primary-drag': (delta: Vec2) => void;
  'pinch': (pivot: Vec2, factor: number) => void;
}

export class UserInput extends Emitter<UserInputEvents> {
  get keys() { return makeReadonly(this._keys); }

  private _keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    q: false,
    e: false
  }

  private pointer = {
    positions: new Map<number, Vec2>(),
    previous_primary: Vec2.ZERO,
    previous_pinch: 0
  }

  constructor(private element: HTMLElement) {
    super();
    this.element.addEventListener('keydown', this.keydown);
    this.element.addEventListener('keyup', this.keyup);
    this.element.addEventListener('pointermove', this.pointermove);
    this.element.addEventListener('pointerdown', this.pointerdown);
    this.element.addEventListener('pointerup', this.pointerup);
    this.element.addEventListener('pointerleave', this.pointerup);
    this.element.addEventListener('pointerout', this.pointerup);
    this.element.addEventListener('pointercancel', this.pointerup);
  }

  private keydown = (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        this._keys.up = true;
        break;
      case "arrowdown":
      case "s":
        this._keys.down = true;
        break;
      case "arrowleft":
      case "a":
        this._keys.left = true;
        break;
      case "arrowright":
      case "d":
        this._keys.right = true;
        break;
      case "q":
        this._keys.q = true;
        break;
      case "e":
        this._keys.e = true;
        break;
    }
  }

  private keyup = (e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "arrowup":
      case "w":
        this._keys.up = false;
        break;
      case "arrowdown":
      case "s":
        this._keys.down = false;
        break;
      case "arrowleft":
      case "a":
        this._keys.left = false;
        break;
      case "arrowright":
      case "d":
        this._keys.right = false;
        break;
      case "q":
        this._keys.q = false;
        break;
      case "e":
        this._keys.e = false;
        break;
    }
  }

  private pointerdown = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const position = new Vec2(e.clientX, e.clientY)
    this.pointer.positions.set(e.pointerId, position);

    if (this.pointer.positions.size === 1) {
      if (e.buttons === 1) {
        this.pointer.previous_primary = position;
      }
    }
    else if (this.pointer.positions.size === 2) {
      const [p1, p2] = this.pointer.positions.values();
      this.pointer.previous_pinch = p2.substract(p1).length();
    }
  }

  private pointermove = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const position = new Vec2(e.clientX, e.clientY);
    this.pointer.positions.set(e.pointerId, position);

    if (this.pointer.positions.size === 1) {
      if (e.buttons === 1) {
        const delta = position.substract(this.pointer.previous_primary);
        this.pointer.previous_primary = position;
        this.emit('primary-drag', delta);
      }
    }
    else if (this.pointer.positions.size === 2) {
      const [p1, p2] = this.pointer.positions.values();
      const center = p1.add(p2.substract(p1).scale(0.5));
      const pinch = p2.substract(p1).length();
      const factor = pinch / this.pointer.previous_pinch;
      this.pointer.previous_pinch = pinch;
      this.emit('pinch', center, factor);
    }
  }
  
  private pointerup = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    this.pointer.positions.delete(e.pointerId);

    if (this.pointer.positions.size === 1) {
        const [p1] = this.pointer.positions.values();
        this.pointer.previous_primary = p1;
    }
  }
}

function makeReadonly<T>(o: T): Readonly<T> { return o; }
